"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { updateOrganization, updateMemberRole, toggleMemberActive } from "@/lib/actions/settings.actions";
import { ROLE_LABELS, INDUSTRIES } from "@/lib/utils/constants";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

interface SettingsTabsProps {
  organization: {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
    size: string | null;
  };
  members: {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
  }[];
  currentUserId: string;
  currentUserRole: Role;
}

export function SettingsTabs({ organization, members, currentUserId, currentUserRole }: SettingsTabsProps) {
  const router = useRouter();
  const isAdmin = currentUserRole === "ADMIN";
  const [updatingOrg, setUpdatingOrg] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const orgForm = useForm<any>({
    defaultValues: {
      name: organization.name,
      website: organization.website ?? "",
      industry: organization.industry ?? "Technology",
      size: organization.size ?? "1-10",
    },
  });

  async function onOrgSubmit(data: any) {
    setUpdatingOrg(true);
    const res = await updateOrganization(data);
    setUpdatingOrg(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Organization profile updated successfully.");
    router.refresh();
  }

  async function handleRoleChange(userId: string, role: Role) {
    setUpdatingUserId(userId);
    const res = await updateMemberRole(userId, role);
    setUpdatingUserId(null);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Team member role updated.");
    router.refresh();
  }

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    setUpdatingUserId(userId);
    const res = await toggleMemberActive(userId, !currentStatus);
    setUpdatingUserId(null);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success(!currentStatus ? "Member activated." : "Member deactivated.");
    router.refresh();
  }

  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="members">Team Members ({members.length})</TabsTrigger>
      </TabsList>

      {/* Organization Settings */}
      <TabsContent value="organization">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-sans">Organization Details</CardTitle>
            <CardDescription>Configure organization profile settings and industry segment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input id="orgName" disabled={!isAdmin} {...orgForm.register("name", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" placeholder="https://example.com" disabled={!isAdmin} {...orgForm.register("website")} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry-select">Industry</Label>
                  <Select
                    defaultValue={orgForm.getValues("industry")}
                    onValueChange={(v) => orgForm.setValue("industry", v)}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="industry-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size-select">Company Size</Label>
                  <Select
                    defaultValue={orgForm.getValues("size")}
                    onValueChange={(v) => orgForm.setValue("size", v)}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="size-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1-10", "11-50", "51-200", "201-500", "501+"].map((sz) => (
                        <SelectItem key={sz} value={sz}>{sz} Employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={updatingOrg}>
                    {updatingOrg ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Members Management */}
      <TabsContent value="members">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-sans">Organization Members</CardTitle>
            <CardDescription>Manage team permissions, role elevations, and account states.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isSelf = member.id === currentUserId;
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          {member.name}
                          {isSelf && <Badge variant="secondary" className="text-[9px] px-1 py-0 scale-90">You</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
                      <TableCell>
                        {isAdmin && !isSelf ? (
                          <select
                            defaultValue={member.role}
                            disabled={updatingUserId === member.id}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                            className="flex h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                          >
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm font-medium text-foreground">{ROLE_LABELS[member.role]}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "outline" : "secondary"} className={cn(member.isActive ? "border-success/20 text-success bg-success/5 font-medium" : "border-border text-muted-foreground bg-muted font-medium")}>
                          {member.isActive ? "Active" : "Deactivated"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={updatingUserId === member.id}
                              onClick={() => handleToggleActive(member.id, member.isActive)}
                              className={cn(member.isActive ? "hover:text-destructive" : "hover:text-success")}
                              title={member.isActive ? "Deactivate member" : "Activate member"}
                            >
                              {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
