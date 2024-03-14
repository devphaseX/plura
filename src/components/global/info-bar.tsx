'use client';

import { User } from '@/schema';
import { NotificationWithUser } from '../../../types';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { UserButton } from '@clerk/nextjs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Bell } from 'lucide-react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Avatar, AvatarImage } from '../ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { ModeToggle } from './mode-toggle';

type InfoBarProps = {
  notifications: NonNullable<NotificationWithUser>[];
  role?: User['role'];
  className?: string;
  subaccountId?: string;
};

export const InfoBar = ({
  notifications,
  className,
  role,
  subaccountId,
}: InfoBarProps) => {
  const [currentNotifications, setCurrentNotifications] =
    useState(notifications);

  const [showAll, setShowAll] = useState(true);
  const handleNotificationKind = () => {
    if (!showAll) {
      setCurrentNotifications(notifications);
    } else {
      setCurrentNotifications(
        notifications?.filter((item) => item?.subaccountId === subaccountId)
      );
    }
    setShowAll((prev) => !prev);
  };

  return (
    <>
      <div
        className={twMerge(
          'fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex  gap-4 items-center border-b-[1px] ',
          className
        )}
      >
        <div className="flex items-center gap-2 ml-auto">
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger>
              <div className="rounded-full w-9 h-9 bg-primary flex items-center justify-center text-white">
                <Bell size={17} />
              </div>
            </SheetTrigger>
            <SheetContent className="mt-4 mr-4  pr-4 flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {(role === 'agency-admin' || role === 'agency-owner') && (
                    <Card className="flex items-center justify-between p-4">
                      Current Subaccount
                      <Switch
                        checked={showAll}
                        onCheckedChange={handleNotificationKind}
                      />
                    </Card>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div>
                {currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col gap-y-2 mb-2 overflow-x-scroll text-ellipsis"
                  >
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarImage
                          src={notification.user.avatarUrl ?? undefined}
                          alt="profile picture"
                        />
                        <AvatarFallback className="bg-primary">
                          {notification.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p>
                          <span className="font-bold">
                            {notification.message.split('|').at(0)}
                          </span>
                          <span className="text-muted-foreground">
                            {notification.message.split('|').at(1)}
                          </span>
                          <span className="font-bold">
                            {notification.message.split('|').at(2)}
                          </span>
                        </p>
                        <small className="text-xs text-muted-foreground">
                          {new Date(
                            notification.createdAt as Date
                          ).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="hidden items-center justify-center  last:flex">
                  You have no notifications
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </>
  );
};
