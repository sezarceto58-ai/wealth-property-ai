import {
  Shield, Building2, Users, BadgeDollarSign, AlertTriangle,
  FileCheck, Activity, Eye, ClipboardList, Database, CreditCard,
  UserCog, Ban, ArrowUpDown, Globe, Coins, MapPin, Search,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const adminStats = {
  totalListings: 2847,
  activeOffers: 342,
  pendingVerifications: 28,
  flaggedListings: 7,
  totalUsers: 14320,
  monthlyRevenue: 48500,
  conversionRate: 3.2,
  avgAqarScore: 71,
};

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "offers", label: "Offers Center", icon: BadgeDollarSign },
  { id: "listings", label: "Listings", icon: Building2 },
  { id: "verification", label: "Verification", icon: FileCheck },
  { id: "fraud", label: "Fraud & Risk", icon: AlertTriangle },
  { id: "users", label: "Users & Plans", icon: UserCog },
  { id: "audit", label: "Audit Log", icon: ClipboardList },
  { id: "master", label: "Master Data", icon: Database },
];

const verificationQueue = [
  { id: "V1", type: "Property", name: "Villa #4521 - Erbil", status: "pending", submitted: "2026-02-12" },
  { id: "V2", type: "Agent", name: "Ahmed Al-Kurdi", status: "under_review", submitted: "2026-02-10" },
  { id: "V3", type: "Developer", name: "Sara Development Co.", status: "pending", submitted: "2026-02-08" },
];

const fraudAlerts = [
  { id: "F1", type: "Duplicate Listing", description: "Property #3201 matches #3198 (92% text similarity)", severity: "high", date: "2026-02-13" },
  { id: "F2", type: "Price Anomaly", description: "Listing priced 340% above neighborhood average", severity: "medium", date: "2026-02-12" },
  { id: "F3", type: "Spam Offers", description: "Buyer 'test_user' submitted 47 offers in 24h", severity: "high", date: "2026-02-11" },
];

const pendingListings = [
  { id: "PL1", title: "2BR Apt - Mansour", agent: "Omar Khalil", submitted: "2026-02-14", flag: "duplicate_suspect" },
  { id: "PL2", title: "Villa with Garden - Erbil", agent: "Dara Group", submitted: "2026-02-13", flag: null },
  { id: "PL3", title: "Commercial Space - Basra", agent: "Gulf Realty", submitted: "2026-02-12", flag: "price_anomaly" },
];

const mockUsers = [
  { id: "U1", name: "Karwan Mohammed", email: "karwan@email.com", plan: "elite", status: "active", offers: 12, joined: "2025-08-10" },
  { id: "U2", name: "Ali Saeed", email: "ali@email.com", plan: "pro", status: "active", offers: 3, joined: "2025-10-05" },
  { id: "U3", name: "test_user", email: "test@spam.com", plan: "free", status: "suspended", offers: 47, joined: "2026-02-10" },
  { id: "U4", name: "Fatima Al-Rawi", email: "fatima@email.com", plan: "elite", status: "active", offers: 8, joined: "2025-06-22" },
  { id: "U5", name: "Noor Al-Din", email: "noor@email.com", plan: "pro", status: "active", offers: 2, joined: "2025-12-01" },
];

const auditLogs = [
  { id: "AL1", action: "Offer Frozen", actor: "Admin: Zara K.", target: "OFF-1022", details: "Spam flagged", timestamp: "2026-02-13 14:22" },
  { id: "AL2", action: "User Suspended", actor: "Admin: Zara K.", target: "test_user", details: "47 spam offers in 24h", timestamp: "2026-02-13 14:20" },
  { id: "AL3", action: "Listing Approved", actor: "Admin: Ahmed M.", target: "Villa with Garden", details: "Verification complete", timestamp: "2026-02-13 10:15" },
  { id: "AL4", action: "Agent Verified", actor: "Admin: Ahmed M.", target: "Ahmed Al-Kurdi", details: "License verified", timestamp: "2026-02-12 16:30" },
  { id: "AL5", action: "Price Override", actor: "System", target: "Property #3201", details: "Anomaly detected, listing flagged", timestamp: "2026-02-12 09:00" },
];

const masterCities = [
  { name: "Erbil", districts: 24, listings: 892, avgPrice: "$185K" },
  { name: "Baghdad", districts: 38, listings: 1204, avgPrice: "$142K" },
  { name: "Basra", districts: 18, listings: 421, avgPrice: "$98K" },
  { name: "Sulaymaniyah", districts: 15, listings: 330, avgPrice: "$127K" },
];

const exchangeRates = [
  { pair: "USD/IQD", rate: "1,310", updated: "2026-02-16" },
  { pair: "EUR/IQD", rate: "1,420", updated: "2026-02-16" },
];

const severityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-info/10 text-info",
};

const planColors: Record<string, string> = {
  elite: "bg-primary/20 text-primary",
  pro: "bg-info/20 text-info",
  free: "bg-secondary text-muted-foreground",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  suspended: "bg-destructive/10 text-destructive",
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Governance Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Admin monitoring, verification, and fraud detection.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Listings" value={adminStats.totalListings.toLocaleString()} change="+124 this month" icon={Building2} trend="up" />
            <StatsCard title="Active Offers" value={adminStats.activeOffers} change="+38 this week" icon={BadgeDollarSign} trend="up" />
            <StatsCard title="Pending Verifications" value={adminStats.pendingVerifications} icon={FileCheck} />
            <StatsCard title="Flagged Listings" value={adminStats.flaggedListings} change="3 new" icon={AlertTriangle} trend="down" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Users" value={adminStats.totalUsers.toLocaleString()} change="+420 this month" icon={Users} trend="up" />
            <StatsCard title="Monthly Revenue" value={`$${adminStats.monthlyRevenue.toLocaleString()}`} change="+12%" icon={BadgeDollarSign} trend="up" />
            <StatsCard title="Conversion Rate" value={`${adminStats.conversionRate}%`} icon={Activity} />
            <StatsCard title="Avg AqarScore" value={adminStats.avgAqarScore} icon={Eye} />
          </div>
        </>
      )}

      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Offer Monitoring Center</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">Freeze Offer</button>
              <button className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">Flag Buyer</button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center py-8">Offer monitoring requires database integration.</p>
        </div>
      )}

      {activeTab === "listings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Listings Moderation Queue</h2>
            <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-bold">{pendingListings.length} pending</span>
          </div>
          {pendingListings.map((listing) => (
            <div key={listing.id} className="rounded-xl bg-card border border-border p-5 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">Agent: {listing.agent} • {listing.submitted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {listing.flag && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    listing.flag === "duplicate_suspect" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>
                    {listing.flag.replace("_", " ")}
                  </span>
                )}
                <button className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">Approve</button>
                <button className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-medium">Request Edits</button>
                <button className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "verification" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Verification Queue</h2>
          {verificationQueue.map((item) => (
            <div key={item.id} className="rounded-xl bg-card border border-border p-5 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.type} • Submitted {item.submitted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning capitalize">
                  {item.status.replace("_", " ")}
                </span>
                <button className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">Approve</button>
                <button className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "fraud" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Fraud & Risk Alerts</h2>
          {fraudAlerts.map((alert) => (
            <div key={alert.id} className="rounded-xl bg-card border border-border p-5 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{alert.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${severityColors[alert.severity]}`}>
                  {alert.severity}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">Investigate</button>
                <button className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Users & Plans Management</h2>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input placeholder="Search users..." className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs outline-none w-48" />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Plan</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Offers</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 animate-fade-in">
                    <td className="p-3">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${planColors[user.plan]}`}>{user.plan}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[user.status]}`}>{user.status}</span>
                    </td>
                    <td className="p-3 text-foreground">{user.offers}</td>
                    <td className="p-3 text-muted-foreground text-xs">{user.joined}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                        <button className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-medium">
                          <Ban className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Audit Log</h2>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-3 font-medium">Timestamp</th>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Actor</th>
                  <th className="text-left p-3 font-medium">Target</th>
                  <th className="text-left p-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 animate-fade-in">
                    <td className="p-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-medium text-foreground">{log.action}</td>
                    <td className="p-3 text-muted-foreground text-xs">{log.actor}</td>
                    <td className="p-3 text-foreground text-xs">{log.target}</td>
                    <td className="p-3 text-muted-foreground text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "master" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-primary" /> Cities & Districts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {masterCities.map((city) => (
                <div key={city.name} className="rounded-xl bg-card border border-border p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">{city.name}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{city.districts} districts</p>
                    <p>{city.listings} active listings</p>
                    <p>Avg price: {city.avgPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Coins className="w-4 h-4 text-primary" /> Exchange Rates
            </h2>
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left p-3 font-medium">Pair</th>
                    <th className="text-left p-3 font-medium">Rate</th>
                    <th className="text-left p-3 font-medium">Last Updated</th>
                    <th className="text-left p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate) => (
                    <tr key={rate.pair} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium text-foreground">{rate.pair}</td>
                      <td className="p-3 text-foreground font-mono">{rate.rate}</td>
                      <td className="p-3 text-muted-foreground text-xs">{rate.updated}</td>
                      <td className="p-3">
                        <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
