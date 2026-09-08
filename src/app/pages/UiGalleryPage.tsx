import { useState } from 'react'
import { toast } from 'sonner'
import { Github, Rocket } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Money } from '@/components/shared/Money'

function DemoForm() {
  return (
    <form
      className="grid max-w-sm gap-4"
      aria-label="Demo form"
      onSubmit={(event) => {
        event.preventDefault()
        toast.success('Submitted', { description: 'Your demo form was received.' })
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="demo-name">Full name</Label>
        <Input id="demo-name" name="name" placeholder="Ada Lovelace" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="demo-email">Email</Label>
        <Input id="demo-email" name="email" type="email" placeholder="ada@bank.com" required />
      </div>
      <Button type="submit">Submit form</Button>
    </form>
  )
}

function DemoDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. It will permanently delete the selected record.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UiGalleryPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">UI Gallery</h1>
        <p className="mt-1 text-muted-foreground">
          Every Phase 1 primitive, consumed so it ships with at least one user.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buttons &amp; badges</CardTitle>
          <CardDescription>Variants via class-variance-authority.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Rocket">
            <Rocket />
          </Button>
          <Button asChild>
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              <Github />
              As child
            </a>
          </Button>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Form: input + label + button</CardTitle>
            <CardDescription>Radix label wires focus to the input.</CardDescription>
          </CardHeader>
          <CardContent>
            <DemoForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select &amp; money</CardTitle>
            <CardDescription>Radix select listbox plus the Money component.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select defaultValue="usd">
              <SelectTrigger className="w-[200px]" aria-label="Currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="gbp">GBP</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-1">
              <Label>Formatted balances (minor units)</Label>
              <p className="text-lg font-semibold tabular-nums">
                <Money amount={1_234_567} currency="USD" />
              </p>
              <p className="text-lg font-semibold tabular-nums">
                <Money amount={1_234_567} currency="EUR" locale="de-DE" />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dialog &amp; dropdown</CardTitle>
          <CardDescription>Focus-trapped and keyboard navigable via Radix.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <DemoDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Dropdown menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>guest@bank.com</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>The tooltip has role=&quot;tooltip&quot;.</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList aria-label="Sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Tabs: overview</CardTitle>
              <CardDescription>Keyboard arrows move between tabs.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Avatar with image fallback</p>
                <p className="text-sm text-muted-foreground">Radix avatar primitives.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Tabs: details</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-3 h-4 w-1/2" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Table</CardTitle>
          <CardDescription>Calls with amounts rendered via Money.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Recent demo transactions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Whole Foods</TableCell>
                <TableCell>Groceries</TableCell>
                <TableCell className="text-right">
                  <Money amount={-4_299} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Acme Payroll</TableCell>
                <TableCell>Income</TableCell>
                <TableCell className="text-right">
                  <Money amount={3_450_000} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">RideShare Inc</TableCell>
                <TableCell>Transport</TableCell>
                <TableCell className="text-right">
                  <Money amount={-1_850} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toast (sonner)</CardTitle>
          <CardDescription>Snackbar notifications, keyboard dismissible.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => toast('Toast from the gallery')}>
            Fire a toast
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
