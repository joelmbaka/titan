import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Content & Marketing */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Content & Marketing</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <NavItem title="Content Creation" href="/content">
                Blog posts, Social media, Product descriptions
              </NavItem>
              <NavItem title="Advertising" href="/ads">
                Meta Ads, Google Ads, Campaign Management
              </NavItem>
              <NavItem title="Social Media" href="/social">
                Scheduling, Posting, Engagement
              </NavItem>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Sales & Outreach */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Sales & Outreach</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] p-4 md:w-[500px] md:grid-cols-2">
              <NavItem title="Lead Management" href="/leads">
                Enrichment, CRM Actions, Drip Campaigns
              </NavItem>
              <NavItem title="Outreach" href="/outreach">
                Cold Emails, Phone Calls, Follow-ups
              </NavItem>
              <NavItem title="Customer Service" href="/support">
                Queries, Tickets, Live Chat
              </NavItem>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Operations */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Operations</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <NavItem title="Inventory" href="/inventory">
                Monitoring, Alerts, Replenishment
              </NavItem>
              <NavItem title="Accounting" href="/finance">
                Bookkeeping, Reports, Invoicing
              </NavItem>
              <NavItem title="HR & Hiring" href="/hr">
                Recruitment, Onboarding, Team Management
              </NavItem>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Team Roles */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>AI Team</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <div className="col-span-2">
                <h3 className="text-sm font-medium">Leadership</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <NavItem title="CEO" href="/ceo" className="text-xs">
                    Strategic Decisions
                  </NavItem>
                  <NavItem title="CFO" href="/cfo" className="text-xs">
                    Financial Oversight
                  </NavItem>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Operations</h3>
                <div className="grid gap-1 mt-2">
                  <NavItem title="Project Manager" href="/pm" className="text-xs"/>
                  <NavItem title="Hiring Manager" href="/hiring" className="text-xs"/>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Technical</h3>
                <div className="grid gap-1 mt-2">
                  <NavItem title="CTO" href="/cto" className="text-xs"/>
                  <NavItem title="Developers" href="/devs" className="text-xs"/>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

      

        {/* Settings */}
        <NavigationMenuItem>
          <Link href="/settings" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

       
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function NavItem({ title, href, children, className }: { 
  title: string;
  href: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} legacyBehavior passHref>
      <NavigationMenuLink className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent",
        className
      )}>
        <div className="text-sm font-medium leading-none">{title}</div>
        {children && <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>}
      </NavigationMenuLink>
    </Link>
  );
} 