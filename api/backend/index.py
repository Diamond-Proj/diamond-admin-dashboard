import logging
import time
import os
from datetime import datetime
import time

import requests
from flask import flash, jsonify, make_response, redirect, request, session, url_for
from globus_compute_sdk import ShellFunction
from globus_compute_sdk import Executor as GlobusComputeExecutor

from api.backend.utils.decorators import authenticated
from api.backend.utils.login_flow import initialize_globus_compute_client
from api.backend.utils.utils import get_safe_redirect, load_portal_client

from . import app, database

# create and configure logger
logging.basicConfig(
    level=logging.INFO,
    datefmt="%Y-%m-%dT%H:%M:%S",
    format="%(asctime)-15s.%(msecs)03dZ %(levelname)-7s : %(name)s - %(message)s",
)
# create log object with current module name
log = logging.getLogger(__name__)

HOST = os.environ.get("HOST")

@app.route("/", methods=["GET"])
def home():
    """Home route."""
    log.info(f"Home route redirecting to {HOST}/sign-in")
    return redirect(HOST + "/sign-in")


@app.route("/api/signup", methods=["GET"])
def signup():
    """Send the user to Globus Auth with signup=1."""
    return redirect(url_for("authcallback", signup=1))


@app.route("/api/login", methods=["GET"])
def login():
    """Send the user to Globus Auth."""
    return redirect(url_for("authcallback"))


@app.route(
    "/api/is_authenticated",
    methods=["GET"],
)
@authenticated
def is_authenticated():
    # log.info(f"cookies in backend: {request.cookies}")
    # log.info(f"session in backend: {session}")
    return jsonify({"is_authenticated": True})


@app.route("/api/list_active_endpoints", methods=["GET"])
@authenticated
def diamond_list_active_endpoints():
    globus_compute_client = initialize_globus_compute_client()
    active_endpoints = []
    endpoints = globus_compute_client.get_endpoints()
    for endpoint in endpoints:
        endpoint_uuid = endpoint["uuid"]
        endpoint_status = globus_compute_client.get_endpoint_status(
            endpoint_uuid=endpoint_uuid
        )["status"]
        if endpoint_status == "online":
            active_endpoints.append(
                {"endpoint_name": endpoint["name"], "endpoint_uuid": endpoint_uuid}
            )
    logging.info(active_endpoints)
    return active_endpoints


# Not used
def apptainer_builder_wrapper(base_image, location, name, dependencies, environment, commands):
    import os
    import textwrap

    # Create a definition file for the apptainer
    def_file_content = f"""Bootstrap: docker
From: {base_image}

%post
    apt-get -y update
    apt-get -y install python3-pip
    mkdir -p /app
    cd /app
    echo "{dependencies}" > requirements.txt
    echo "cd /app
    {commands}" > commands.sh
    chmod +x commands.sh
    /bin/bash commands.sh

%environment
    {environment}

%runscript
    /bin/bash /app/commands.sh"""

    def_file_path = os.path.join(location, f"{name}.def")

    with open(def_file_path, "w") as def_file:
        def_file.write(textwrap.dedent(def_file_content.strip()))  # for testing


    # Build the container
    build_command = f"apptainer build {os.path.join(location, name)}.sif {def_file_path}"
    os.system(f"({build_command}) 2>&1 | tee {location}/{name}_log.txt")

    return


## Testing in non-HPC systems using docker
def container_builder_wrapper(base_image, location, name, dependencies, environment, commands):
    import os
    import textwrap

    # Create a Dockerfile for the container
    dockerfile_content = f"""
    FROM {base_image}

    RUN apt-get -y update && apt-get -y install python3-pip
    COPY requirements.txt /app/requirements.txt
    RUN pip install -r /app/requirements.txt
    COPY commands.sh /app/commands.sh
    RUN chmod +x /app/commands.sh

    ENV {environment}

    CMD ["/app/commands.sh"]
    """
    dockerfile_path = os.path.join(location, "Dockerfile")
    with open(dockerfile_path, "w") as dockerfile:
        dockerfile.write(textwrap.dedent(dockerfile_content.strip()))

    # Write dependencies and commands to files
    with open(os.path.join(location, "requirements.txt"), "w") as req_file:
        req_file.write(dependencies)
    
    with open(os.path.join(location, "commands.sh"), "w") as cmd_file:
        cmd_file.write(commands)

    # Build the Docker image
    build_command = f"docker build -t {name} {location}"
    os.system(f"({build_command}) 2>&1 | tee {location}/{name}_log.txt")

    return


apptainer_def_file_creation = ShellFunction(
"""
cat << EOF > {location}/{container_name}.def
Bootstrap: docker
From: {base_image}

%post
    echo "post section"
    apt-get -y update
    apt-get -y install apt-utils
    apt-get -y install python3-pip
    mkdir -p /app
    cd /app
    echo $PWD
    {commands} > commands.sh
    chmod +x commands.sh
    /bin/bash commands.sh

%environment
    {environment}

%runscript
    /bin/bash /app/commands.sh
EOF
"""
)


container_builder_wrapper_shell = ShellFunction(
"""
cat << EOF > test.submit
#!/bin/bash

#SBATCH --job-name={container_name}
#SBATCH --output={location}/{container_name}_log.stdout
#SBATCH --error={location}/{container_name}_log.stderr
{slurm_commands}  
echo $PWD
srun apptainer build {location}/{container_name}.sif {location}/{container_name}.def

EOF

sbatch $PWD/test.submit
echo "SHELL ECHO"
"""
)


@app.route("/api/image_builder", methods=["POST"])
@authenticated
def diamond_endpoint_image_builder():

    endpoint_id = request.json.get("endpoint")
    name = request.json.get("name")
    # name = f"image-{endpoint_id}-v{datetime.now().strftime('%Y%m%d%H%M%S')}"
    base_image = request.json.get("base_image")
    dependencies = request.json.get("dependencies")
    environment = request.json.get("environment")
    commands = request.json.get("commands")
    location = request.json.get("location")
    account = request.json.get("account")
    partitions = request.json.get("partition")

    logging.info(f"endpoint_id: {endpoint_id}")
    logging.info(f"container_name: {name}")
    logging.info(f"base_image: {base_image}")
    logging.info(f"dependencies: {dependencies}")
    logging.info(f"environment: {environment}")
    logging.info(f"commands: {commands}")
    logging.info(f"location: {location}")
    logging.info(f"account: {account}")
    logging.info(f"partitions: {partitions}")

    slurm_commands = f"""
#SBATCH --time=00:10:00
#SBATCH --ntasks-per-node=1
#SBATCH --exclusive
#SBATCH --partition={partitions}  
#SBATCH --account={account}
"""
    
    # use get_partitions Shell function. 
    # Use a env to have the command to get user accounts in an hpc system . Eg "accounts" in Delta.
    # We need user input text input for accounts now.
    
    # First we create the def file using ShellFunction.
    globus_compute_client = initialize_globus_compute_client()
    def_file_creation_function_id = globus_compute_client.register_function(apptainer_def_file_creation)
    def_file_creation_task_id = globus_compute_client.run(
        endpoint_id=endpoint_id,
        base_image=base_image,
        location=location,
        dependencies=dependencies,
        commands=commands,
        environment=environment,
        function_id=def_file_creation_function_id,
        container_name=name
    )
    # Wait for the def file creation task to complete.
    def_file_creation_task_status = globus_compute_client.get_task(def_file_creation_task_id)
    while (def_file_creation_task_status["pending"]):
        print("def_file_creation_task_id", def_file_creation_task_status)
        time.sleep(10)
        def_file_creation_task_status = globus_compute_client.get_task(def_file_creation_task_id)
        continue

    print("def_file_creation_task_id", def_file_creation_task_status)
    # Then we create the container using ShellFunction with SBATCH commands.
    function_id = globus_compute_client.register_function(container_builder_wrapper_shell)
    container_task_id = globus_compute_client.run(
        container_name=name,
        base_image=base_image,
        location=location,
        endpoint_id=endpoint_id,
        function_id=function_id,
        slurm_commands=slurm_commands
    )
    # Output is available at {location}/{base_image}_log.stdout
    # container_task_status = globus_compute_client.get_task(container_task_id)
    # print("container_builder_wrapper_shell" , container_task_status)
    # while (container_task_status["pending"]):
    #     print("container_builder_wrapper_shell" , container_task_status)
    #     time.sleep(10)
    #     container_task_status = globus_compute_client.get_task(container_task_id)
    #     continue

    database.save_container(
        container_task_id=container_task_id,
        identity_id=session["primary_identity"],
        name=name,
        base_image=base_image,
        location=location,
        dependencies=dependencies,
        environment=environment,
        commands=commands,
    )
    return jsonify({"task_id": container_task_id, "container_name": name})

def log_reader_wrapper(log_file_path):
    """Wrapper function to read log file content"""
    try:
        with open(log_file_path, 'r') as f:
            content = f.read()
            # Check if build is complete
            is_complete = 'INFO:    Build complete:' in content
            return {
                'content': content,
                'is_complete': is_complete
            }
    except Exception as e:
        return {
            'content': f"Error reading log file: {str(e)}",
            'is_complete': False,
            'error': str(e)
        }

@app.route("/api/get_build_log", methods=["GET"])
@authenticated
def get_build_log():
    """Get the content of a container build log file."""
    globus_compute_client = initialize_globus_compute_client()
    
    # Get parameters from request
    log_file_path = request.args.get("log_path")
    endpoint_id = request.args.get("endpoint_id")
    build_task_id = request.args.get("task_id")  # Original build task ID
    log_task_id = request.args.get("log_task_id")  # Previous log reader task ID
    
    if not log_file_path or not endpoint_id:
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        # Register function only once and store its ID
        if not hasattr(get_build_log, 'log_reader_function_id'):
            get_build_log.log_reader_function_id = globus_compute_client.register_function(log_reader_wrapper)
            print(f'Registered log reader function: {get_build_log.log_reader_function_id}')

        # Create new log reader task if no log_task_id
        if not log_task_id:
            log_task_id = globus_compute_client.run(
                endpoint_id=endpoint_id,
                function_id=get_build_log.log_reader_function_id,
                log_file_path=log_file_path
            )
            print(f'Created new log reader task: {log_task_id}')
        
        # Get status of current log reader task
        log_task_status = globus_compute_client.get_task(log_task_id)
        print(f'Log task status: {log_task_status}')
        
        # Get log content if task completed
        log_result = None
        if log_task_status.get('status') == 'success':
            try:
                log_result = globus_compute_client.get_result(log_task_id)
                print(f"Log result: {log_result}")
                
                # Create new task using the same function ID
                new_log_task_id = globus_compute_client.run(
                    endpoint_id=endpoint_id,
                    function_id=get_build_log.log_reader_function_id,
                    log_file_path=log_file_path
                )
            except Exception as e:
                print(f"Error getting log result: {e}")
                log_result = {'content': '', 'is_complete': False}
                new_log_task_id = log_task_id
        else:
            new_log_task_id = log_task_id

        # Check build task status if available
        build_status = "running"
        if build_task_id:
            try:
                build_task_status = globus_compute_client.get_task(build_task_id)
                build_status = build_task_status.get('status', 'running')
            except:
                pass

        # Determine overall status
        if log_result and log_result.get('is_complete'):
            status = "completed"
        elif build_status in ['failed', 'error']:
            status = build_status
        else:
            status = "running"

        return jsonify({
            "status": status,
            "log_content": log_result.get('content', '') if log_result else '',
            "build_task_id": build_task_id,
            "log_task_id": new_log_task_id
        })
        
    except Exception as e:
        logging.error(f"Error getting build log: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route("/api/get_containers", methods=["GET"])
@authenticated
def get_containers():
    global_compute_client = initialize_globus_compute_client()

    containers = database.load_containers(identity_id=session["primary_identity"])
    containers_data = {}
    for container in containers:
        logging.info(f"container: {container.container_task_id}")
        container_task_id = container.container_task_id
        name = container.name
        container_status = global_compute_client.get_task(container_task_id)
        containers_data[name] = {
            "container_task_id": container_task_id,
            "status": container_status["status"],
            "base_image": container.base_image,
            "location": container.location,
            # "description": container["description"],
        }

    logging.info(f"container status is {containers_data}")
    return jsonify(containers_data)


@app.route("/api/delete_container", methods=["POST"])
@authenticated
def diamond_delete_container():
    container_id = request.json.get("containerId")
    database.delete_container(container_id) 
    logging.info(f"container {container_id} deleted")
    return jsonify({"message": "Container deleted successfully"})

# Todo:
# 1. Build image - apptainer build - register container -> Build image from image builder form
# 2. Run image - apptainer run - submit task -> Run image (command, container_path) from job composer form


# def task_wrapper(task_command, log_path, container_path):
#     import os
#     import textwrap
#     if not container_path:
#         command = textwrap.dedent(task_command.strip())
#         os.system(f"({command}) 2>&1 | tee {log_path}")
#         return log_path
#     else:
#         load_apptainer = "module load apptainer"
#         load_apptainer = textwrap.dedent(load_apptainer.strip())
#         command = f"apptainer run --nv {container_path} {task_command}"
#         command = textwrap.dedent(command.strip())
#         os.system(f"({load_apptainer}) 2>&1 | tee {log_path}")
#         os.system(f"({command}) 2>&1 | tee {log_path}")
#         return log_path

get_partitions = ShellFunction('sinfo -h -o "%P"')
get_accounts = ShellFunction(os.getenv('ACCOUNTS_COMMAND', 'accounts'))

@app.route("/api/list_partitions", methods=["POST"])
@authenticated
def diamond_get_partitions():
    endpoint_id = request.json.get("endpoint")
    logging.info(f"endpoint_id: {endpoint_id}")
    globus_compute_client = initialize_globus_compute_client()
    globus_compute_executer = GlobusComputeExecutor(
        client=globus_compute_client, endpoint_id=endpoint_id)
    fu = globus_compute_executer.submit(get_partitions)
    partitions = fu.result().stdout
    partition_list = partitions.split("\n")
    for partition in partition_list:
        if not partition:
            partition_list.remove(partition)
    logging.info(f"partitions: {partition_list}")
    return jsonify(partition_list)

@app.route("/api/list_accounts", methods=["POST"]) 
@authenticated
def diamond_get_accounts():
    endpoint_id = request.json.get("endpoint")
    logging.info(f"endpoint_id: {endpoint_id}")
    globus_compute_client = initialize_globus_compute_client()
    globus_compute_executer = GlobusComputeExecutor(
        client=globus_compute_client, endpoint_id=endpoint_id)
    fu = globus_compute_executer.submit(get_accounts)
    accounts = fu.result().stdout
    account_list = accounts.split("\n")
    for account in account_list:
        if not account:
            account_list.remove(account)
    logging.info(f"accounts: {account_list}")
    return jsonify(account_list)

submit_task = ShellFunction("""
cat << EOF > test.submit
#!/bin/bash

#SBATCH --job-name={task_name}
#SBATCH --output={log_path}/{task_name}.stdout
#SBATCH --error={log_path}/{task_name}.stderr
#SBATCH --nodes=1
#SBATCH --time=01:00:00
#SBATCH --ntasks-per-node=1
#SBATCH --exclusive
#SBATCH --partition={partition}
#SBATCH --account=Deep-Learning-at-Sca
                           
module load tacc-apptainer
apptainer run --nv {container} {task}

EOF

sbatch $PWD/test.submit
cat $PWD/test.submit
""")

@app.route("/api/submit_task", methods=["POST"])
@authenticated
def diamond_endpoint_submit_job():
    endpoint_id = request.json.get("endpoint")
    task_name = request.json.get("taskName")
    partition = request.json.get("partition")
    container = request.json.get("container")
    log_path = request.json.get("log_path")
    task = request.json.get("task")

    container_path = database.get_container_path_by_name(container)

    globus_compute_client=initialize_globus_compute_client()

    function_id = globus_compute_client.register_function(submit_task)
    
    task_id = globus_compute_client.run(
        partition=partition,
        container=container_path + "/" + container + ".sif",
        task=task,
        log_path=log_path,
        endpoint_id=endpoint_id,
        function_id=function_id,
        task_name=task_name,
    )

    database.save_task(
        task_id=task_id,
        task_name=task_name,
        identity_id=session["primary_identity"],
        task_status="submitted",
        task_create_time=datetime.now(),
        log_path=log_path,
    )
    return jsonify("hello")



@app.route("/api/get_task_status", methods=["GET"])
@authenticated
def diamond_get_task_status():
    global_compute_client = initialize_globus_compute_client()

    # Load tasks from the database for the authenticated user
    tasks = database.load_tasks(identity_id=session["primary_identity"])

    # Update each task's status in the database
    for task in tasks:
        task_id = task.task_id
        logging.info(f"Updating status for task ID: {task_id}")

        current_task = global_compute_client.get_task(task_id)

        task.task_status = current_task["status"]
        task.endpoint_id = current_task["details"]["endpoint_id"]

        database.save_task(
            task_id=task.task_id,
            task_name=task.task_name,
            identity_id=task.identity_id,
            task_status=task.task_status,
            task_create_time=task.task_create_time,
            log_path=task.log_path
        )

    # Reload the updated tasks from the database
    updated_tasks = database.load_tasks(identity_id=session["primary_identity"])

    # Format tasks data for JSON response
    tasks_data = {
        task.task_id: {
            "task_id": task.task_id,
            "identity_id": task.identity_id,
            "task_name": task.task_name,
            "status": task.task_status,
            "details": {
                "endpoint_id": task.endpoint_id if hasattr(task, 'endpoint_id') else "N/A",
                "task_create_time": task.task_create_time,
            },
            "result": task.log_path,
        }
        for task in updated_tasks
    }

    logging.info(f"Updated task status response: {tasks_data}")
    return jsonify(tasks_data)


@app.route("/api/delete_task", methods=["POST"])
@authenticated
def diamond_delete_task():
    task_id = request.json.get("taskId")
    database.delete_task(task_id)
    logging.info(f"task {task_id} deleted")
    return jsonify({"message": "Task deleted successfully"})


@app.route("/api/logout", methods=["GET"])
@authenticated
def logout():
    """
    - Revoke the tokens with Globus Auth.
    - Destroy the session state.
    - Remove cookies containing 'tokens'.
    - Redirect the user to the Globus Auth logout page.
    """
    client = load_portal_client()

    # Revoke the tokens with Globus Auth
    for token, token_type in (
        (token_info[ty], ty)
        # get all of the token info dicts
        for token_info in session["tokens"].values()
        # cross product with the set of token types
        for ty in ("access_token", "refresh_token")
        # only where the relevant token is actually present
        if token_info[ty] is not None
    ):
        client.oauth2_revoke_token(token, body_params={"token_type_hint": token_type})

    # Destroy the session state
    session.clear()

    # Remove cookies containing 'tokens'
    response = make_response(redirect(url_for("home", _external=True)))
    response.delete_cookie("tokens")

    log.info(f"Session after clearing: {session}")

    redirect_uri = url_for("home", _external=True)

    ga_logout_url = []
    ga_logout_url.append(os.environ["GLOBUS_AUTH_LOGOUT_URI"])
    ga_logout_url.append("?client={}".format(os.environ["PORTAL_CLIENT_ID"]))
    ga_logout_url.append("&redirect_uri={}".format(redirect_uri))
    ga_logout_url.append("&redirect_name=Diamond Service")

    # Redirect the user to the Globus Auth logout page
    response.headers["Location"] = "".join(ga_logout_url)
    return response


@app.route("/api/profile", methods=["GET", "POST"])
@authenticated
def profile():
    """User profile information. Assocated with a Globus Auth identity."""
    log.info("profile route")
    if request.method == "GET":
        identity_id = session.get("primary_identity")
        profile = database.load_profile(identity_id)
        log.info(f"Profile: {profile}")

        if profile:
            session["name"] = profile.name
            session["email"] = profile.email
            session["institution"] = profile.institution
        else:
            flash("Please complete any missing profile fields and press Save.")

        if request.args.get("next"):
            session["next"] = get_safe_redirect()

        log.info(f"Session: {session}")

        if not profile and session.get("is_authenticated") == True:
            identity_id = session["primary_identity"]
            name = session["name"]
            email = session["email"]
            institution = session["institution"]
            database.save_profile(
                identity_id=identity_id,
                name=name,
                email=email,
                institution=institution,
            )

            flash("Thank you! Your profile has been successfully updated.")
            return redirect(url_for("profile"))
        # return jsonify(
        #     {
        #         "name": session["name"],
        #         "email": session["email"],
        #         "institution": session["institution"],
        #     }
        # )
        # return render_template("profile.jinja2")
        # Redirect to localhost:3000/profile
        response = make_response(redirect(f"{HOST}"))
        response.set_cookie("is_authenticated", "true")
        response.set_cookie("primary_username", session["primary_username"])
        response.set_cookie("primary_identity", session["primary_identity"])
        response.set_cookie("name", session["name"])
        response.set_cookie("email", session["email"])
        response.set_cookie("institution", session["institution"])
        response.set_cookie("tokens", str(session["tokens"]))
        return response
    elif request.method == "POST":
        name = session["name"] = request.form["name"]
        email = session["email"] = request.form["email"]
        institution = session["institution"] = request.form["institution"]
        database.save_profile(
            identity_id=session["primary_identity"],
            name=name,
            email=email,
            institution=institution,
        )

        flash("Thank you! Your profile has been successfully updated.")

        if "next" in session:
            redirect_to = session["next"]
            session.pop("next")
        else:
            redirect_to = url_for("profile")

        return redirect(redirect_to)


@app.route("/api/authcallback", methods=["GET"])
def authcallback():
    """Handles the interaction with Globus Auth."""
    # If we're coming back from Globus Auth in an error state, the error
    # will be in the "error" query string parameter.
    if "error" in request.args:
        flash(
            "You could not be logged into the portal: "
            + request.args.get("error_description", request.args["error"])
        )
        return redirect(url_for("home"))

    # Set up our Globus Auth/OAuth2 state
    redirect_uri = url_for("authcallback", _external=True)

    client = load_portal_client()
    client.oauth2_start_flow(
        redirect_uri,
        refresh_tokens=True,
        requested_scopes=os.environ["USER_SCOPES"].split(),
    )

    # If there's no "code" query string parameter, we're in this route
    # starting a Globus Auth login flow.
    if "code" not in request.args:
        additional_authorize_params = (
            {"signup": 1} if request.args.get("signup") else {}
        )

        auth_uri = client.oauth2_get_authorize_url(
            query_params=additional_authorize_params
        )

        return redirect(auth_uri)
    else:
        # If we do have a "code" param, we're coming back from Globus Auth
        # and can start the process of exchanging an auth code for a token.
        code = request.args.get("code")
        tokens = client.oauth2_exchange_code_for_tokens(code)

        id_token = tokens.decode_id_token()
        session.update(
            tokens=tokens.by_resource_server,
            is_authenticated=True,
            name=id_token.get("name"),
            email=id_token.get("email"),
            institution=id_token.get("organization"),
            primary_username=id_token.get("preferred_username"),
            primary_identity=id_token.get("sub"),
        )

        profile = database.load_profile(session["primary_identity"])

        if profile:
            session["name"] = profile.name
            session["email"] = profile.email
            session["institution"] = profile.institution
            log.info("profile found redirecting to profile... GET")
            return redirect(url_for("profile"))
        else:
            log.info("profile not found, creating...")

            # Create a mock form with the necessary data
            form_data = {
                "name": session["name"],
                "email": session["email"],
                "institution": session["institution"],
                "identity_id": session["primary_identity"],
            }

            # Send a POST request to the profile creation endpoint
            response = requests.post(url_for("profile", _external=True), json=form_data)

            log.info("POST profile call done, redirecting to profile... GET")
            if response.status_code == 200:
                return redirect(url_for("profile"))
            else:
                log.error("Failed to create profile")
                return "Error creating profile", 500


@app.route("/api/loadprofile", methods=["GET"])
def loadprofile():
    log.info("loadprofile route")
    return redirect(url_for("profile"))


if __name__ == "__main__":
    app.run(port=5328)
