import { useState } from 'react'
import { toast } from 'sonner'
import {
  Bell,
  Braces,
  Fingerprint,
  Github,
  Globe,
  Layers,
  Palette,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Table2,
} from 'lucide-react'
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

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Layers
  title: string
  description: string
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 ring-1 ring-emerald-500/20">
          <Icon className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </span>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

const SWATCHES = [
  { name: 'Emerald', className: 'bg-emerald-500' },
  { name: 'Teal', className: 'bg-teal-500' },
  { name: 'Cyan', className: 'bg-cyan-500' },
  { name: 'Violet', className: 'bg-violet-500' },
  { name: 'Rose', className: 'bg-rose-500' },
  { name: 'Amber', className: 'bg-amber-500' },
]

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 p-8 text-white shadow-xl lg:p-10">
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-20 bg-radial-fade" />
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 size-72 rounded-full bg-emerald-300/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
              <Palette className="size-3.5" aria-hidden="true" />
              Design system
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">UI Gallery</h1>
            <p className="mt-2 text-sm text-white/80">
              Every Phase 1 primitive, consumed so it ships with at least one user — buttons, forms,
              dialogs, tables, and feedback, all living happily in one place.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">
                <Money amount={12_345_67} currency="NGN" />
              </p>
              <p className="text-xs text-white/70">Sample balance in minor units</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-2xl font-bold">14+</p>
              <p className="text-xs text-white/70">primitives shipped</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/60 shadow-card-hover">
        <SectionHeading
          icon={Sparkles}
          title="Buttons &amp; badges"
          description="Variants via class-variance-authority."
        />
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="default" className="bg-gradient-to-r from-emerald-600 to-teal-600">
            Default
          </Button>
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
        <Card className="rounded-3xl border-border/60 shadow-card-hover">
          <SectionHeading
            icon={SlidersHorizontal}
            title="Form: input + label + button"
            description="Radix label wires focus to the input."
          />
          <CardContent>
            <DemoForm />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 shadow-card-hover">
          <SectionHeading
            icon={Globe}
            title="Select, money &amp; colors"
            description="Radix listbox, the Money component and theme tokens."
          />
          <CardContent className="space-y-5">
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
            <div className="flex flex-wrap gap-2" aria-label="Color palette">
              {SWATCHES.map((swatch) => (
                <span
                  key={swatch.name}
                  className={`size-8 rounded-full ${swatch.className} ring-2 ring-background shadow-sm`}
                  title={swatch.name}
                  aria-hidden="true"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-border/60 shadow-card-hover">
        <SectionHeading
          icon={Layers}
          title="Dialog, dropdown &amp; tooltip"
          description="Focus-trapped and keyboard navigable via Radix."
        />
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
          <Card className="rounded-3xl border-border/60 shadow-card-hover">
            <SectionHeading
              icon={Fingerprint}
              title="Tabs: overview"
              description="Keyboard arrows move between tabs."
            />
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
          <Card className="rounded-3xl border-border/60 shadow-card-hover">
            <SectionHeading
              icon={Braces}
              title="Tabs: details"
              description="Skeletons preview loading states."
            />
            <CardContent>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-3 h-4 w-1/2" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="rounded-3xl border-border/60 shadow-card-hover">
        <SectionHeading
          icon={Table2}
          title="Table"
          description="Calls with amounts rendered via Money."
        />
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

      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-card-hover">
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
        />
        <SectionHeading
          icon={Bell}
          title="Toast (sonner)"
          description="Snackbar notifications, keyboard dismissible."
        />
        <CardFooter>
          <Button variant="outline" onClick={() => toast('Toast from the gallery')}>
            Fire a toast
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
