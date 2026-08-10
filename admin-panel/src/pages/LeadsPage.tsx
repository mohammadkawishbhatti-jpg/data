import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useListLeads,
  useUpdateLeadStatus,
  getListLeadsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { StatusBadge } from "../components/ui/StatusBadge";
import { format } from "date-fns";

const TABS = ["All", "New", "Read", "Replied"];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const [viewLead, setViewLead] = useState<any | null>(null);

  const { data: leads = [], isLoading } = useListLeads();

  const updateStatus = useUpdateLeadStatus();

  const filteredLeads = activeTab === "All" 
    ? leads 
    : leads.filter(l => l.status.toLowerCase() === activeTab.toLowerCase());

  const handleStatusChange = (newStatus: string) => {
    if (!viewLead) return;
    
    updateStatus.mutate({ id: viewLead.id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        setViewLead({ ...viewLead, status: newStatus });
      }
    });
  };

  // Auto-mark as read when opened if it's new
  const openLead = (lead: any) => {
    setViewLead(lead);
    if (lead.status === "new") {
      updateStatus.mutate({ id: lead.id, data: { status: "read" } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
          setViewLead({ ...lead, status: "read" });
        }
      });
    }
  };

  return (
    <AdminLayout title="Leads">
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No leads found for this filter.</td></tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className={`hover:bg-muted/5 transition-colors cursor-pointer ${lead.status === 'new' ? 'bg-primary/5 font-medium' : ''}`} onClick={() => openLead(lead)}>
                    <td className="px-4 py-3 text-muted-foreground">#{lead.id}</td>
                    <td className="px-4 py-3 text-foreground">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]">{lead.subject}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewLead} onClose={() => setViewLead(null)} title="Contact Message">
        {viewLead && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <StatusBadge status={viewLead.status} />
              </div>
              <div>
                <label className="text-sm font-medium mr-2">Update to:</label>
                <select 
                  className="h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-background"
                  value={viewLead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updateStatus.isPending}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">From</p>
                <p className="font-medium">{viewLead.name}</p>
                <p><a href={`mailto:${viewLead.email}`} className="text-primary hover:underline">{viewLead.email}</a></p>
                {viewLead.phone && <p>{viewLead.phone}</p>}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Submitted On</p>
                <p>{format(new Date(viewLead.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-sm font-medium border-b pb-2">Subject: {viewLead.subject}</p>
              <div className="bg-muted/10 p-5 rounded-md border text-sm whitespace-pre-wrap mt-3 leading-relaxed">
                {viewLead.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
