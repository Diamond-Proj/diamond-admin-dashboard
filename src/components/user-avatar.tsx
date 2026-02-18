'use client';

import { useState, useEffect } from 'react';
import { LogoutButton } from './logout-button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function UserAvatar() {
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');

  // Get user info from cookies
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const nameCookie = cookies.find(cookie => cookie.trim().startsWith('name='));
    const emailCookie = cookies.find(cookie => cookie.trim().startsWith('email='));
    
    if (nameCookie) {
      const name = decodeURIComponent(nameCookie.split('=')[1]);
      setUserName(name);
    }
    
    if (emailCookie) {
      const email = decodeURIComponent(emailCookie.split('=')[1]);
      setUserEmail(email);
    }
  }, []);

  // Get initials for avatar
  const getInitials = () => {
    if (!userName || userName === 'User') return 'U';
    
    const nameParts = userName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarFallback className="bg-blue-500 text-white">{getInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="px-2 py-1.5">
            <a 
              href="/profile" 
              className="block w-full px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Profile
            </a>
          </div>
          <div className="px-2 py-1.5">
            <a 
              href="/endpoints" 
              className="block w-full px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Endpoints
            </a>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="w-full">
            <LogoutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 