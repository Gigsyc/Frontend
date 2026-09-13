"use client";

import { motion } from "motion/react";
import { Award, GraduationCap, Pencil, Plus } from "lucide-react";
import { RoleIcon } from "@/components/common/role-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES } from "@/data/roles";
import type { Worker } from "@/types";
import { staggerItem } from "../lib/motion";
import { AvailabilityCard } from "./availability-card";

interface AboutTabProps {
  worker: Worker;
  onEditProfile: () => void;
  onEditSkills: () => void;
  onAddCertification: () => void;
}

export function AboutTab({ worker, onEditProfile, onEditSkills, onAddCertification }: AboutTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 px-4 sm:px-5">
          <CardTitle>About</CardTitle>
          <Button variant="ghost" size="sm" onClick={onEditProfile}><Pencil /> Edit</Button>
        </CardHeader>
        <CardContent className="px-4 pt-3 sm:px-5">
          {worker.bio ? <p className="text-sm leading-6 text-fg">{worker.bio}</p> : <p className="text-sm text-fg-muted">Tell employers where you&rsquo;ve worked and what you&rsquo;re good at. Two or three sentences is plenty.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 px-4 sm:px-5">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Roles you can be booked for. First is your primary.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onEditSkills}><Pencil /> Edit skills</Button>
        </CardHeader>
        <CardContent className="px-4 pt-3 sm:px-5">
          {worker.skills.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {worker.skills.map((s, i) => (
                <motion.li key={s} {...staggerItem(i)} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <RoleIcon role={s} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{ROLES[s].short}</span>
                    <span className="block text-xs text-fg-muted">{i === 0 ? "Primary" : ROLES[s].label !== ROLES[s].short ? ROLES[s].label : "Skill"}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">No skills yet. Add the roles you&rsquo;re ready to work.</p>
          )}
        </CardContent>
      </Card>

      <AvailabilityCard worker={worker} />

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 px-4 sm:px-5">
          <div>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>Courses and licences employers can ask about.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onAddCertification}><Plus /> Add</Button>
        </CardHeader>
        <CardContent className="px-4 pt-3 sm:px-5">
          {worker.certifications.length ? (
            <ul className="divide-y divide-border">
              {worker.certifications.map((c, i) => (
                <motion.li key={c} {...staggerItem(i)} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-800"><Award className="size-4" aria-hidden /></span>
                  <span className="text-fg">{c}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">Nothing listed yet. Food safety, responsible alcohol service or a protocol course all help you rank for specialist shifts.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 px-4 sm:px-5">
          <CardTitle>Education</CardTitle>
          <Button variant="ghost" size="sm" onClick={onEditProfile}><Pencil /> Edit</Button>
        </CardHeader>
        <CardContent className="px-4 pt-3 sm:px-5">
          {worker.education ? (
            <p className="inline-flex items-start gap-3 text-sm text-fg">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800"><GraduationCap className="size-4" aria-hidden /></span>
              <span className="pt-1.5">{worker.education}</span>
            </p>
          ) : (
            <p className="text-sm text-fg-muted">Add your degree, diploma or current studies.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
