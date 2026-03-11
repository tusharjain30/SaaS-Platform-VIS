import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Download,
  Upload,
  AlertCircle,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import CreateContactModal from "@/components/contacts/CreateContactModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UpdateContactForm from "@/components/contacts/UpdateContactForm";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  groups: { id: string; title: string }[];
  isOptedOut: boolean;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const groupColors = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

const getGroupColor = (name: string) => {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    groupColors.length;

  return groupColors[index];
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewContact, setViewContact] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedContacts((prev) =>
      prev.length === contacts.length ? [] : contacts.map((c) => c.id),
    );
  };

  const handleEdit = (contactId: string) => {
    setEditContactId(contactId);
    setOpenEditModal(true);
  };

  const handleContactUpdated = () => {
    setOpenEditModal(false);
    fetchContacts();
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/user/contacts/contact/read?page=${page}&limit=${limit}&search=${debouncedSearch}`,
        {
          headers: getAuthHeaders(),
        },
      );

      const json = await res.json();

      if (res.ok && json.status === 1) {
        setContacts(json.data?.contacts || []);
        setTotal(json.data?.meta?.total || 0);
        setTotalPages(json.data?.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (contactId: string) => {
    try {
      setViewLoading(true);
      setOpenViewModal(true);

      const res = await fetch(
        `${API_BASE}/user/contacts/contact/detail/${contactId}`,
        {
          headers: getAuthHeaders(),
        },
      );

      const json = await res.json();

      if (res.ok && json.status === 1) {
        setViewContact(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch contact:", err);
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset pagination on search
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchContacts();
  }, [page, limit, debouncedSearch]);

  const handleContactCreated = () => {
    setOpenCreateModal(false);
    fetchContacts();
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Contacts</h1>
                <p className="text-muted-foreground text-xs">
                  Manage your contact list and segments
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2 text-xs">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" className="gap-2 text-xs">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button
                  className="text-xs gradient-whatsapp text-primary-foreground gap-2"
                  onClick={() => setOpenCreateModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="card-elevated p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    placeholder="Search name, email or phone..."
                    className="pl-10 bg-muted/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows:</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Rows: {limit}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      {[5, 10, 20, 50].map((size) => (
                        <DropdownMenuItem
                          key={size}
                          onClick={() => {
                            setLimit(size);
                            setPage(1);
                          }}
                        >
                          {size} rows
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* <Button variant="outline" className="gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Button> */}
              </div>
            </div>

            {/* Contacts Table */}
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="px-4 py-4 w-10">
                      <Checkbox
                        checked={selectedContacts.length === contacts.length}
                        onCheckedChange={toggleAll}
                      />
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Name
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Phone
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Groups
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Created
                    </th>

                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    Array.from({ length: limit }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-4">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
                        </td>
                      </tr>
                    ))}
                  {!loading && contacts && contacts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10">
                        <div className="flex justify-center">
                          <div className="w-full max-w-md border-2 border-dashed border-red-300 bg-red-50/40 rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-center">
                            <AlertCircle className="h-8 w-8 text-red-500" />

                            <span className="text-sm font-semibold text-red-600">
                              No contacts found
                            </span>

                            <p className="text-xs text-muted-foreground">
                              Try adjusting your search or create a new contact.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {contacts &&
                    contacts.length > 0 &&
                    contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => toggleContact(contact.id)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                                {`${contact.firstName[0] ?? ""}${contact.lastName?.[0] ?? ""}`}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">
                                {contact.firstName} {contact.lastName}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                Contact
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail
                              className={`h-4 w-4 ${contact.email ? "" : "opacity-40"}`}
                            />
                            {contact.email ? (
                              <span className="truncate max-w-[220px]">
                                {contact.email}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/70">
                                No email
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-foreground">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {contact.phone?.replace(/(\d{5})(\d{5})/, "$1-$2")}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 max-w-[260px] flex-wrap">
                            {contact.groups && contact.groups.length > 0 ? (
                              <>
                                {contact.groups.slice(0, 2).map((group) => (
                                  <Badge
                                    key={group.id}
                                    className={`text-xs border ${getGroupColor(group.title)}`}
                                  >
                                    {group.title.length > 10
                                      ? group.title.slice(0, 10) + "..."
                                      : group.title}
                                  </Badge>
                                ))}

                                {contact.groups.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-muted text-muted-foreground cursor-pointer"
                                    title={`Groups:\n${contact.groups
                                      .map((g, i) => `${i + 1}. ${g.title}`)
                                      .join("\n")}`}
                                  >
                                    +{contact.groups.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="italic text-muted-foreground/70 text-sm">
                                No groups
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleView(contact.id)}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleEdit(contact.id)}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                                // onClick={() => handleDelete(contact.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total > 0
                  ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total} contacts`
                  : "No contacts"}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            <CreateContactModal
              open={openCreateModal}
              onClose={() => setOpenCreateModal(false)}
              onSuccess={handleContactCreated}
            />

            <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Contact Details</DialogTitle>
                </DialogHeader>

                {viewLoading && (
                  <div className="text-center py-6 text-muted-foreground">
                    Loading contact...
                  </div>
                )}

                {viewContact && (
                  <div className="space-y-5 text-sm">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-xs">
                          First Name
                        </p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.firstName || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">
                          Last Name
                        </p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.lastName || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.email || "No email"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">Phone</p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.phone
                            ? viewContact.phone.replace(
                                /(\d{5})(\d{5})/,
                                "$1-$2",
                              )
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">Country</p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.country || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">
                          Language Code
                        </p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.languageCode || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">
                          Opted Out
                        </p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {viewContact.isOptedOut ? "Yes" : "No"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs">Created</p>
                        <p className="font-medium text-xs bg-green-100 px-1 py-1 rounded-sm mt-1">
                          {new Date(viewContact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Groups */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Groups</p>

                      <div className="flex flex-wrap gap-2">
                        {viewContact.groups?.length > 0 ? (
                          viewContact.groups.map((g: any) => (
                            <Badge key={g.id} variant="secondary">
                              {g.title}
                            </Badge>
                          ))
                        ) : (
                          <span className="italic text-muted-foreground">
                            No groups
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Custom Fields */}
                    {viewContact.customFields &&
                      Object.keys(viewContact.customFields).length > 0 && (
                        <div>
                          <p className="font-semibold text-xs mb-3">
                            Custom Fields
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(viewContact.customFields).map(
                              ([key, value]) => (
                                <div key={key}>
                                  <p className="text-muted-foreground text-xs capitalize">
                                    {key.replace(/_/g, " ")}
                                  </p>

                                  <p className="font-medium break-all text-xs bg-green-100 px-1 py-1 rounded-sm  mt-1">
                                    {String(value) || "-"}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Update Contact</DialogTitle>
                </DialogHeader>

                {editContactId && (
                  <UpdateContactForm
                    contactId={editContactId}
                    onSuccess={handleContactUpdated}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
