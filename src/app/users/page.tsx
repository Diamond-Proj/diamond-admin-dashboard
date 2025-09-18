// import { getUsers } from '@/lib/db';
// import { UsersTable } from './users-table';
import { Search } from './search';

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ q: string; offset: string }>;
}) {
  const { q, offset: searchOffset } = await searchParams;
  const search = q ?? '';
  const offset = searchOffset ?? 0;
  // const { users, newOffset } = await getUsers(search, Number(offset));

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="mb-8 flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Users</h1>
      </div>
      <div className="mb-4 w-full">
        <Search value={q} />
      </div>
      {/* <UsersTable users={users} offset={newOffset} /> */}
    </main>
  );
}
