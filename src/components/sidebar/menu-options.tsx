'use client';

import {
  Subaccount,
  AgencySidebarOption,
  SubaccountSidebarOption,
  User,
  Agency,
} from '@/schema';
import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import clsx from 'clsx';
import { AspectRatio } from '../ui/aspect-ratio';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import Link from 'next/link';
import { useModal } from '@/providers/modal-provider';
import { CustomModal } from '../global/custom-modal';
import { SubaccountDetails } from '../forms/subaccount-details';
import { Separator } from '../ui/separator';
import { icons } from '@/lib/constants';
import { isNull } from 'drizzle-orm';

type MenuOptionsProps = {
  defaultOpen?: boolean;
  subaccounts: Subaccount[];
  sidebarOptions: AgencySidebarOption[] | SubaccountSidebarOption[];
  sidebarLogo: string;
  details: { name: string; address: string };
  user: User & { agency?: Agency };
  id: string;
};

const MenuOptions = ({
  defaultOpen,
  subaccounts,
  sidebarLogo,
  sidebarOptions,
  user,
  details,
  id,
}: MenuOptionsProps) => {
  const [mounted, setMounted] = useState(false);
  const { setOpen } = useModal();

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;
  return (
    <Sheet modal={false} open={true} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:hidden flex"
      >
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side="left"
        className={clsx(
          'bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100px] w-full': !defaultOpen,
          }
        )}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="sidebar logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts" />
                <CommandList>
                  <CommandEmpty>No result found</CommandEmpty>
                  {user?.role === 'agency-owner' ||
                  user?.role === 'agency-admin' ? (
                    <CommandGroup heading="Agency">
                      <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                        {defaultOpen ? (
                          <Link
                            href={`/agency/${user?.agency?.id}`}
                            className="flex gap-4 w-full h-full"
                          >
                            <div className="relative w-16">
                              <Image
                                src={user?.agency?.agencyLogo ?? ''}
                                alt="Agency Logo"
                                fill
                                className="rounded-md object-contain"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              {user?.agency?.name}
                              <span className="text-muted-foreground">
                                {user.agency?.address}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/agency/${user?.agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.agency?.agencyLogo ?? ''}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.agency?.name}
                                <span className="text-muted-foreground">
                                  {user.agency?.address}
                                </span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    </CommandGroup>
                  ) : null}
                  <CommandGroup heading="Accounts">
                    <div className="hidden last:block  text-foreground">
                      No account
                    </div>
                    {(subaccounts ?? []).map((subaccount) => (
                      <CommandItem key={subaccount.id}>
                        {defaultOpen ? (
                          <Link
                            href={`/subaccount/${subaccount.id}`}
                            className="flex gap-4 w-full h-full"
                          >
                            <div className="relative w-16">
                              <Image
                                src={subaccount.subAccountLogo ?? ''}
                                alt="Subaccount Logo"
                                fill
                                className="rounded-md object-contain"
                              />
                            </div>
                            <div className="flex flex-col flex-1">
                              {subaccount.name}
                              <span className="text-muted-foreground">
                                {subaccount.address}
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <SheetClose asChild>
                            <Link
                              href={`/subaccount/${subaccount.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={subaccount.subAccountLogo ?? ''}
                                  alt="Subaccount Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {subaccount.name}
                                <span className="text-muted-foreground">
                                  {subaccount.address}
                                </span>
                              </div>
                            </Link>
                          </SheetClose>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'agency-owner' ||
                  user?.role === 'agency-admin') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() =>
                        setOpen(
                          <CustomModal
                            title="Create A Subaccount"
                            subheading="You can switch between your agency and subaccount in the sidebar"
                          >
                            <SubaccountDetails />
                          </CustomModal>
                        )
                      }
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2 uppercase">
            MENU LINKS
          </p>
          <Separator className="mb-4" />
          <nav>
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." />
              <CommandList className="pb-16 overflow-visible">
                <CommandEmpty>No result found</CommandEmpty>
                <CommandGroup>
                  {sidebarOptions.map((option) => {
                    const Icon = icons.find(
                      (icon) => icon.value === option.icon
                    )?.path;
                    return (
                      <CommandItem
                        key={option.id}
                        className="md:w-[320px] w-full"
                      >
                        <Link
                          href={option.link as string}
                          className="flex items-center gap-2 hover:bg-transparent rounded-md 
                          transition-all md:w-full w-[320px]"
                        >
                          {Icon && <Icon />}
                          {option.name}
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { MenuOptions };
