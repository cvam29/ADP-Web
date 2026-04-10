"use client"

import { useEffect, useMemo, useState } from "react"
import { useEventsStore } from "@/store/useEventsStore"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { ADPSpinner } from "@/components/ui/adp-spinner"
import EventCard from "@/components/events/event-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PublicEventsPage() {
	const { events, fetchEvents, loading } = useEventsStore()
	const [searchTerm, setSearchTerm] = useState("")
	const [initialLoading, setInitialLoading] = useState(true)
	const [statusTab, setStatusTab] = useState<"all" | "upcoming" | "past">("all")
	const [typeFilter, setTypeFilter] = useState<string>("all")
	const [formatFilter, setFormatFilter] = useState<string>("all")
	const [freeOnly, setFreeOnly] = useState<boolean>(false)
	const [sortBy, setSortBy] = useState<"dateAsc" | "dateDesc">("dateAsc")

	useEffect(() => {
		const load = async () => {
			try {
				setInitialLoading(true)
				await fetchEvents({ page: 1, pageSize: 50 })
			} finally {
				setInitialLoading(false)
			}
		}
		load()
	}, [fetchEvents])

	const uniqueTypes = useMemo(() => {
		const set = new Set<string>()
		for (const e of events || []) { if (e.type) set.add(e.type) }
		return Array.from(set)
	}, [events])

	const uniqueFormats = useMemo(() => {
		const set = new Set<string>()
		for (const e of events || []) { if (e.format) set.add(e.format) }
		return Array.from(set)
	}, [events])

	const isUpcoming = (dateStr?: string | null) => {
		if (!dateStr) return false
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return false
		const now = new Date()
		// Consider same-day as upcoming
		return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
	}

	const isPast = (dateStr?: string | null) => {
		if (!dateStr) return false
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return false
		const now = new Date()
		return d < new Date(now.getFullYear(), now.getMonth(), now.getDate())
	}

	const priceToNumber = (price: unknown) => {
		if (typeof price === 'number') return price
		if (typeof price === 'string') {
			const n = parseFloat(price)
			return Number.isFinite(n) ? n : 0
		}
		return 0
	}

	const filtered = useMemo(() => {
		const q = searchTerm.toLowerCase()
		let list = (events || []).filter(e =>
			(e.title || "").toLowerCase().includes(q) ||
			(e.location || "").toLowerCase().includes(q) ||
			(e.type || "").toLowerCase().includes(q)
		)

	if (statusTab === "upcoming") list = list.filter(e => isUpcoming(e.date))
	if (statusTab === "past") list = list.filter(e => isPast(e.date))
	if (typeFilter !== "all") list = list.filter(e => (e.type || "") === typeFilter)
	if (formatFilter !== "all") list = list.filter(e => (e.format || "") === formatFilter)
		if (freeOnly) list = list.filter(e => priceToNumber(e.price as unknown) === 0)

		list = list.sort((a, b) => {
			const da = a.date ? new Date(a.date).getTime() : 0
			const db = b.date ? new Date(b.date).getTime() : 0
			return sortBy === "dateAsc" ? da - db : db - da
		})

		return list
	}, [events, searchTerm, statusTab, typeFilter, formatFilter, freeOnly, sortBy])

	// no-op helper removed

	return (
			<div className="bg-background min-h-screen">
				{/* Hero */}
				<section className="border-b border-border bg-secondary/30 py-16 px-4">
					<div className="max-w-7xl mx-auto flex items-end justify-between gap-6 flex-wrap">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
								Calendar
							</p>
							<h1 className="text-4xl font-bold tracking-tight text-foreground">Upcoming Events</h1>
							<p className="text-base text-muted-foreground mt-2">Discover learning opportunities, workshops, and conferences.</p>
						</div>
						<div className="relative w-full sm:w-80">
							<Input
								placeholder="Search events by title, location, or type"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 bg-background border-border"
							/>
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						</div>
					</div>
				</section>

				<div className="container py-8 px-4 space-y-6">
					{/* Filters */}
					<div className="max-w-7xl mx-auto space-y-4">
						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as any)}>
								<TabsList>
									<TabsTrigger value="all">All</TabsTrigger>
									<TabsTrigger value="upcoming">Upcoming</TabsTrigger>
									<TabsTrigger value="past">Past</TabsTrigger>
								</TabsList>
							</Tabs>
							<div className="flex flex-wrap gap-3 items-center">
								<Select value={typeFilter} onValueChange={setTypeFilter}>
									<SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All types</SelectItem>
										{uniqueTypes.map((t) => (
											<SelectItem key={t} value={t}>{t}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select value={formatFilter} onValueChange={setFormatFilter}>
									<SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Format" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All formats</SelectItem>
										{uniqueFormats.map((f) => (
											<SelectItem key={f} value={f}>{f}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<label className="flex items-center gap-2 text-sm text-slate-600">
									<Checkbox checked={freeOnly} onCheckedChange={(v) => setFreeOnly(Boolean(v))} />
									<span>Free only</span>
								</label>
								<Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
									<SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="dateAsc">Date: Soonest first</SelectItem>
										<SelectItem value="dateDesc">Date: Newest first</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Active filters */}
						{(typeFilter !== 'all' || formatFilter !== 'all' || freeOnly || statusTab !== 'all') && (
							<div className="max-w-5xl mx-auto flex flex-wrap items-center gap-2">
								{statusTab !== 'all' && (
									<Badge variant="secondary" className="flex items-center gap-1">{statusTab}<button onClick={() => setStatusTab('all')} className="ml-1 text-slate-500 hover:text-slate-700"><X className="h-3 w-3" /></button></Badge>
								)}
								{typeFilter !== 'all' && (
									<Badge variant="secondary" className="flex items-center gap-1">{typeFilter}<button onClick={() => setTypeFilter('all')} className="ml-1 text-slate-500 hover:text-slate-700"><X className="h-3 w-3" /></button></Badge>
								)}
								{formatFilter !== 'all' && (
									<Badge variant="secondary" className="flex items-center gap-1">{formatFilter}<button onClick={() => setFormatFilter('all')} className="ml-1 text-slate-500 hover:text-slate-700"><X className="h-3 w-3" /></button></Badge>
								)}
								{freeOnly && (
									<Badge variant="secondary" className="flex items-center gap-1">Free<button onClick={() => setFreeOnly(false)} className="ml-1 text-slate-500 hover:text-slate-700"><X className="h-3 w-3" /></button></Badge>
								)}
								<Button variant="ghost" size="sm" onClick={() => { setStatusTab('all'); setTypeFilter('all'); setFormatFilter('all'); setFreeOnly(false) }}>Clear</Button>
							</div>
						)}
					</div>

			{initialLoading ? (
				<div className="flex items-center justify-center min-h-[200px]">
				<ADPSpinner size="sm" />
				</div>
			) : (
			<div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		  {filtered.map((e) => (
			<EventCard key={e.id || e.title} event={e} />
		  ))}

		  {filtered.length === 0 && (
			<div className="col-span-full text-center text-muted-foreground py-12">
			  No events found.
			</div>
		  )}
		</div>
			)}
		  </div>
	</div>
	)
}

