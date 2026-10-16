import '../styles/ModuleDashboard.css';
import ModuleIntro from './ModuleIntro';

export type DashboardModule = 'clubs' | 'captain-leads' | 'department-executives' | 'budget-requests' | 'venue-requests' | 'events';

interface ModuleDashboardProps {
	module: DashboardModule;
	title: string;
	records: Record<string, any>[];
	refOptions: Record<string, Record<string, string>>;
}

const COLORS = ['#349576', '#8DE0C0', '#F2C96D', '#5FBE9A', '#2B7D63', '#AAB7B8'];

function countBy(records: Record<string, any>[], getKey: (record: Record<string, any>) => string) {
	const counts = new Map<string, number>();
	records.forEach((record) => {
		const key = getKey(record) || 'Unspecified';
		counts.set(key, (counts.get(key) ?? 0) + 1);
	});
	return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function numberValue(value: unknown) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value: number) {
	return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
}

function dateValue(value: unknown) {
	const date = new Date(String(value));
	return Number.isNaN(date.getTime()) ? null : date;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
	return (
		<div className="rd-dashboard-metric">
			<span>{label}</span>
			<strong>{value}</strong>
			{detail && <small>{detail}</small>}
		</div>
	);
}

function DistributionChart({ data, label, formatter }: { data: { name: string; value: number }[]; label: string; formatter?: (value: number) => string }) {
	if (data.length === 0) return null;
	const chartData = data.slice(0, 8);
	const maximum = Math.max(...chartData.map((entry) => entry.value), 1);
	return (
		<section className="rd-dashboard-card rd-dashboard-chart-card">
			<h3>{label}</h3>
			<div className="rd-dashboard-bars" aria-label={label}>
				{chartData.map((entry, index) => (
					<div className="rd-dashboard-bar-row" key={entry.name}>
						<div className="rd-dashboard-bar-label" title={entry.name}>{entry.name}</div>
						<div className="rd-dashboard-bar-track">
							<div className="rd-dashboard-bar-fill" style={{ width: `${(entry.value / maximum) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} />
						</div>
						<strong>{formatter ? formatter(entry.value) : entry.value}</strong>
					</div>
				))}
			</div>
		</section>
	);
}

function PieDistribution({ data, label }: { data: { name: string; value: number }[]; label: string }) {
	if (data.length === 0) return null;
	const total = data.reduce((sum, entry) => sum + entry.value, 0);
	return (
		<section className="rd-dashboard-card rd-dashboard-chart-card">
			<h3>{label}</h3>
			<div className="rd-dashboard-distribution">
				<div
					className="rd-dashboard-distribution-ring"
					style={{
						background: `conic-gradient(${data.reduce((stops, entry, index) => {
							const start = stops.offset;
							const end = start + (entry.value / total) * 360;
							stops.parts.push(`${COLORS[index % COLORS.length]} ${start}deg ${end}deg`);
							stops.offset = end;
							return stops;
						}, { parts: [] as string[], offset: 0 }).parts.join(', ')})`,
					}}
					aria-label={`${label}: ${data.map((entry) => `${entry.name} ${entry.value}`).join(', ')}`}
				>
					<span>{total}</span>
				</div>
				<div className="rd-dashboard-legend">
					{data.slice(0, 8).map((entry, index) => (
						<div key={entry.name}>
							<span className="rd-dashboard-legend-swatch" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
							<span title={entry.name}>{entry.name}</span>
							<strong>{entry.value}</strong>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export default function ModuleDashboard({ module, title, records, refOptions }: ModuleDashboardProps) {
	if (records.length === 0) {
		return <p className="rd-empty-state">No {title.toLowerCase()} data available for dashboard metrics.</p>;
	}

	const clubName = (id: unknown) => refOptions.clubId?.[String(id)] ?? 'Unassigned club';

	if (module === 'clubs') {
		const memberTotal = records.reduce((sum, record) => sum + numberValue(record.memberCount), 0);
		return (
			<div className="rd-dashboard">
				<ModuleIntro title="Clubs dashboard" description="Current club totals, membership, and geographic distribution." count={`${records.length} clubs`} />
				<div className="rd-dashboard-metrics"><Metric label="Total clubs" value={records.length} /><Metric label="Total members" value={memberTotal.toLocaleString()} /><Metric label="Average members" value={(memberTotal / records.length).toFixed(1)} /></div>
				<div className="rd-dashboard-grid"><PieDistribution data={countBy(records, (record) => String(record.clubType ?? 'Unspecified'))} label="Club type" /><DistributionChart data={countBy(records, (record) => String(record.islandGroup ?? 'Unspecified'))} label="Island group" /></div>
			</div>
		);
	}

	if (module === 'captain-leads') {
		const linkedProfiles = records.filter((record) => record.linkedinUrl || record.credlyUrl).length;
		return (
			<div className="rd-dashboard">
				<ModuleIntro title="Captain & Leads dashboard" description="Personnel totals and club assignment coverage from the current registry." count={`${records.length} personnel`} />
				<div className="rd-dashboard-metrics"><Metric label="Total personnel" value={records.length} /><Metric label="Assigned clubs" value={countBy(records, (record) => clubName(record.clubId)).length} /><Metric label="Profile links" value={linkedProfiles} detail="LinkedIn or Credly" /></div>
				<DistributionChart data={countBy(records, (record) => clubName(record.clubId))} label="Personnel by club" />
			</div>
		);
	}

	if (module === 'department-executives') {
		return (
			<div className="rd-dashboard">
				<ModuleIntro title="Department executives dashboard" description="Current executive assignments by department and club." count={`${records.length} executives`} />
				<div className="rd-dashboard-metrics"><Metric label="Total executives" value={records.length} /><Metric label="Departments" value={countBy(records, (record) => String(record.department ?? 'Unspecified')).length} /><Metric label="Assigned clubs" value={countBy(records, (record) => clubName(record.clubId)).length} /></div>
				<div className="rd-dashboard-grid"><DistributionChart data={countBy(records, (record) => String(record.department ?? 'Unspecified'))} label="By department" /><DistributionChart data={countBy(records, (record) => clubName(record.clubId))} label="By club" /></div>
			</div>
		);
	}

	if (module === 'budget-requests') {
		const amounts = records.map((record) => numberValue(record.requestedAmount));
		const total = amounts.reduce((sum, amount) => sum + amount, 0);
		return (
			<div className="rd-dashboard">
				<ModuleIntro title="Budget requests dashboard" description="Requested amounts and current request classifications from submitted records." count={`${records.length} requests`} />
				<div className="rd-dashboard-metrics"><Metric label="Total requests" value={records.length} /><Metric label="Requested total" value={currency(total)} /><Metric label="Average request" value={currency(total / records.length)} /></div>
				<div className="rd-dashboard-grid"><PieDistribution data={countBy(records, (record) => String(record.participantTier ?? 'Unspecified'))} label="Participant tier" /><DistributionChart data={countBy(records, (record) => String(record.requesteeType ?? 'Unspecified'))} label="Requestee type" /></div>
			</div>
		);
	}

	if (module === 'venue-requests') {
		const paxTotal = records.reduce((sum, record) => sum + numberValue(record.numberOfPax), 0);
		return (
			<div className="rd-dashboard">
				<ModuleIntro title="Venue requests dashboard" description="Reservation totals, attendance capacity, and floor distribution." count={`${records.length} requests`} />
				<div className="rd-dashboard-metrics"><Metric label="Total requests" value={records.length} /><Metric label="Total pax" value={paxTotal.toLocaleString()} /><Metric label="Average pax" value={(paxTotal / records.length).toFixed(1)} /></div>
				<div className="rd-dashboard-grid"><DistributionChart data={countBy(records, (record) => String(record.floor ?? 'Unspecified'))} label="Requests by floor" /><DistributionChart data={countBy(records, (record) => clubName(record.clubId))} label="Requests by club" /></div>
			</div>
		);
	}

	const expectedParticipants = records.reduce((sum, record) => sum + numberValue(record.expectedParticipants), 0);
	const upcoming = records.filter((record) => {
		const start = dateValue(record.startDate);
		return start !== null && start >= new Date();
	}).length;
	return (
		<div className="rd-dashboard">
			<ModuleIntro title="Events dashboard" description="Current event schedule, types, and expected participation." count={`${records.length} events`} />
			<div className="rd-dashboard-metrics"><Metric label="Total events" value={records.length} /><Metric label="Expected participants" value={expectedParticipants.toLocaleString()} /><Metric label="Upcoming events" value={upcoming} /></div>
			<div className="rd-dashboard-grid"><PieDistribution data={countBy(records, (record) => String(record.eventType ?? 'Unspecified'))} label="Event type" /><DistributionChart data={countBy(records, (record) => String(record.location ?? 'Unspecified'))} label="By location" /></div>
		</div>
	);
}
