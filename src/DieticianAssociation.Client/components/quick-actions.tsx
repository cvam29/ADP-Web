import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, CreditCard, Settings } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Download Certificate",
    description: "Get your membership certificate",
    icon: Download,
    href: "/certificate",
    color: "text-emerald-600",
  },
  {
    title: "Update Profile",
    description: "Manage your account settings",
    icon: Settings,
    href: "/profile",
    color: "text-blue-600",
  },
  {
    title: "Renew Membership",
    description: "Extend your membership",
    icon: CreditCard,
    href: "/membership/renew",
    color: "text-purple-600",
  },
  {
    title: "Find Members",
    description: "Connect with other professionals",
    icon: Users,
    href: "/members",
    color: "text-amber-600",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button key={index} asChild variant="outline" className="h-auto p-3 flex flex-col items-center space-y-2">
                <Link href={action.href}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                  <div className="text-center">
                    <div className="text-xs font-medium">{action.title}</div>
                    <div className="text-xs text-slate-500">{action.description}</div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
