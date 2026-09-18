"use client";

import { Building2, Save, ShieldCheck, Upload, UserPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ActionDialogButton } from "@/components/ui/action-dialog-button";
import { RecordActions } from "@/components/ui/record-actions";
import { deleteUser, readSession, readUsers, saveUser, type AppRole, type UserStatus } from "@/lib/auth-session";
import { saveStudioProfile, useStudioProfile } from "@/lib/studio-profile";

type TeamMemberRecord = {
  name: string;
  email: string;
  role: AppRole;
  status: UserStatus;
};

const teamMemberFields = [
  { label: "Name", name: "name" },
  { label: "Email", name: "email", type: "email" },
  { label: "Role", name: "role", type: "select", options: ["ADMIN", "MANAGER", "SALES", "DESIGNER", "PRODUCTION", "FINANCE", "DELIVERY"] },
  { label: "Status", name: "status", type: "select", options: ["Active", "Invited", "Suspended"] },
] as const;

export default function CompanyPage() {
  const companyProfile = useStudioProfile();
  const [teamMemberRecords, setTeamMemberRecords] = useState<TeamMemberRecord[]>([]);
  const [logoDataUrl, setLogoDataUrl] = useState(companyProfile.logoDataUrl ?? "");
  const [message, setMessage] = useState("");

  function syncTeamMembers() {
    const session = readSession();

    if (!session) {
      setTeamMemberRecords([]);
      return;
    }

    const members = readUsers()
      .filter((user) => user.companyName === session.companyName)
      .map(({ name, email, role, status }) => ({ name, email, role, status: status ?? "Active" }));

    if (!members.some((member) => member.email === session.email)) {
      members.unshift({ name: session.name, email: session.email, role: session.role, status: "Active" });
    }

    setTeamMemberRecords(members);
  }

  useEffect(() => {
    syncTeamMembers();
  }, []);

  function uploadLogo(file: File | undefined) {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 320;
        const ratio = Math.min(size / image.width, size / image.height, 1);
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;
        if (context) {
          context.fillStyle = "#ffffff";
        }
        context?.fillRect(0, 0, size, size);
        context?.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        setLogoDataUrl(canvas.toDataURL("image/jpeg", 0.9));
        setMessage("Logo ready. Save company info to use it on documents.");
      };
      image.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  }

  function saveCompanyInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const savedProfile = saveStudioProfile({
      name: String(formData.get("name") ?? companyProfile.name),
      slug: String(formData.get("slug") ?? companyProfile.slug),
      email: String(formData.get("email") ?? companyProfile.email),
      phone: String(formData.get("phone") ?? companyProfile.phone),
      address: String(formData.get("address") ?? companyProfile.address),
      currency: String(formData.get("currency") ?? companyProfile.currency),
      tin: String(formData.get("tin") ?? companyProfile.tin),
      vatNumber: String(formData.get("vatNumber") ?? companyProfile.vatNumber),
      logoDataUrl: logoDataUrl || companyProfile.logoDataUrl,
    });

    setMessage(`${savedProfile.name} company info saved.`);
  }

  return (
    <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h1 className="mt-2 text-3xl font-semibold text-white">Company setup</h1>
          <p className="mt-2 text-sm text-slate-400">Tenant profile, document defaults, tax settings, and user roles.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-5 flex items-center gap-2 text-slate-200">
              <Building2 className="h-5 w-5 text-emerald-300" />
              Profile
            </div>
            <form className="space-y-4" onSubmit={saveCompanyInfo}>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
                {logoDataUrl || companyProfile.logoDataUrl ? (
                  <img
                    src={logoDataUrl || companyProfile.logoDataUrl}
                    alt={`${companyProfile.name} logo`}
                    className="h-16 w-16 rounded-xl border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/15 text-xl font-bold text-emerald-300">
                    {companyProfile.name.charAt(0)}
                  </div>
                )}
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-3 text-sm text-slate-200 transition hover:bg-slate-800">
                  <Upload className="h-4 w-4 text-emerald-300" />
                  Upload logo
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => uploadLogo(event.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Studio name", "name", companyProfile.name],
                  ["Slug", "slug", companyProfile.slug],
                  ["Phone", "phone", companyProfile.phone],
                  ["Email", "email", companyProfile.email],
                  ["Address", "address", companyProfile.address],
                  ["Currency", "currency", companyProfile.currency],
                  ["TIN", "tin", companyProfile.tin],
                  ["VAT", "vatNumber", companyProfile.vatNumber],
                ].map(([label, name, value]) => (
                  <label key={name} className="block">
                    <span className="mb-2 block text-sm text-slate-300">{label}</span>
                    <input
                      name={name}
                      defaultValue={value}
                      type={name === "email" ? "email" : "text"}
                      className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-emerald-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="text-sm text-emerald-200">{message}</div>
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  <Save className="h-4 w-4" />
                  Save info
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-200">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                Users and roles
              </div>
              <ActionDialogButton
                label="Invite"
                title="Invite user"
                description="Invite a teammate and assign their role for tenant-scoped access."
                submitLabel="Send invite"
                size="compact"
                fields={[
                  { label: "First name", name: "firstName", placeholder: "Neema" },
                  { label: "Last name", name: "lastName", placeholder: "Sales" },
                  { label: "Email", name: "email", type: "email", placeholder: "name@company.com" },
                  { label: "Temporary password", name: "password", type: "password", placeholder: "At least 8 characters" },
                  { label: "Role", name: "role", type: "select", options: ["ADMIN", "MANAGER", "SALES", "DESIGNER", "PRODUCTION", "FINANCE", "DELIVERY"] },
                ]}
                onSubmit={(formData) => {
                  const session = readSession();
                  const firstName = String(formData.get("firstName") ?? "").trim();
                  const lastName = String(formData.get("lastName") ?? "").trim();
                  const email = String(formData.get("email") ?? "").trim().toLowerCase();
                  const password = String(formData.get("password") ?? "");
                  const role = String(formData.get("role") ?? "SALES") as AppRole;

                  if (!session || session.role !== "ADMIN" || !firstName || !lastName || !email || password.length < 8) {
                    setMessage("Admin access, names, email, and a password of at least 8 characters are required.");
                    return;
                  }

                  if (readUsers().some((user) => user.companyName === session.companyName && user.email === email)) {
                    setMessage(`${email} is already part of this workspace.`);
                    return;
                  }

                  saveUser({
                    email,
                    password,
                    companyName: session.companyName,
                    name: `${firstName} ${lastName}`,
                    role,
                    status: "Invited",
                  });
                  syncTeamMembers();
                  setMessage(`${email} was invited as ${role}.`);
                }}
              >
                <UserPlus className="h-4 w-4" />
              </ActionDialogButton>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMemberRecords.map((member) => (
                    <tr key={member.email} className="border-t border-slate-800 bg-slate-900/40">
                      <td className="px-4 py-3 text-white">{member.name}</td>
                      <td className="px-4 py-3 text-slate-300">{member.email}</td>
                      <td className="px-4 py-3 text-slate-300">{member.role}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RecordActions
                          record={member}
                          title={member.name}
                          fields={teamMemberFields}
                          onSave={(updatedMember) => {
                            const session = readSession();
                            const storedUser = readUsers().find(
                              (user) => user.email === member.email && user.companyName === session?.companyName,
                            );

                            if (session && storedUser) {
                              saveUser({ ...storedUser, ...updatedMember });
                            }
                            setTeamMemberRecords((current) => current.map((item) => (item.email === member.email ? updatedMember : item)));
                            setMessage(`${updatedMember.name} profile updated.`);
                          }}
                          onDelete={() => {
                            const session = readSession();
                            if (session) {
                              deleteUser(member.email, session.companyName);
                            }
                            setTeamMemberRecords((current) => current.filter((item) => item.email !== member.email));
                            setMessage(`${member.name} removed from this workspace.`);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </div>
  );
}
