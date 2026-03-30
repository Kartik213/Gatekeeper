"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Check, Copy, RefreshCw, Trash2 } from "lucide-react";
import { DeleteApiKeyModal } from "@/components/modals/DeleteApiKeyModal";
import { CreateApiKeyForm } from "@/components/forms/CreateApiKeyForm";
import { useRouter } from "next/navigation";

const INSTALL_COMMANDS = {
  npm: "npm install @gatekeeper-dev/sdk",
  yarn: "yarn add @gatekeeper-dev/sdk",
  pnpm: "pnpm add @gatekeeper-dev/sdk",
  bun: "bun add @gatekeeper-dev/sdk",
} as const;

type PkgManager = keyof typeof INSTALL_COMMANDS;

export default function SettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { data: apiKeys, isPending } = trpc.apiKeys.list.useQuery({ projectId });
  const apiKey = apiKeys?.[0];

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PkgManager>("npm");

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyBaseUrl = () => {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    navigator.clipboard.writeText(baseUrl);
    setCopiedBaseUrl(true);
    setTimeout(() => setCopiedBaseUrl(false), 2000);
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(INSTALL_COMMANDS[selectedPkg]);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}`}
          className="text-muted-foreground hover:text-primary text-sm transition-colors"
        >
          &larr; Back to flags
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage API key for SDK authentication
          </p>
        </div>
        {apiKey && (
          <Button
            variant={apiKey ? "outline" : "default"}
            onClick={() => {
              setNewKey(null);
            }}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Regenerate Key
          </Button>
        )}
      </div>

      <DeleteApiKeyModal
        projectId={projectId}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
      />

      {/* Newly created key */}
      {newKey && (
        <Alert className="animate-fade-in-down mb-6 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>
            <span className="mb-1 block text-[13px] font-medium text-emerald-800 dark:text-emerald-300">
              API key created successfully
            </span>
            <span className="mb-3 block text-xs text-emerald-700 dark:text-emerald-400">
              Copy this key now. You won&apos;t be able to see it again.
            </span>
            <div className="flex items-center gap-2">
              <code className="bg-background flex-1 rounded-lg border border-emerald-300 p-3 font-mono text-[13px] leading-relaxed break-all dark:border-emerald-700">
                {newKey}
              </code>
              <Button
                variant="outline"
                onClick={copyKey}
                className="h-10 shrink-0 px-4 text-[13px]"
              >
                {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key display */}
      {isPending ? (
        <div className="text-muted-foreground py-12 text-center text-sm">Loading API key...</div>
      ) : !apiKey ? (
        <Card className="text-center">
          <CardContent>
            <CreateApiKeyForm
              projectId={projectId}
              onSuccess={(key) => {
                setNewKey(key);
              }}
              onCancel={() => {
                router.push(`/projects/${projectId}`);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-fade-in-down overflow-hidden px-5">
          <CardHeader className="border-b pb-3 text-[13px]">
            <CardTitle className="flex items-center justify-between text-sm font-semibold">
              <span>Active API Key</span>
              <Badge
                variant="outline"
                className="h-5 text-[10px] font-medium tracking-wider uppercase"
              >
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <div className="p-0">
            <Table>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-muted-foreground w-1/4 py-4 pl-6 text-[13px] font-medium">
                    Name
                  </TableCell>
                  <TableCell className="py-4 text-[13px] font-medium">{apiKey.name}</TableCell>
                </TableRow>
                <TableRow className="border-t hover:bg-transparent">
                  <TableCell className="text-muted-foreground py-2 pl-6 text-[13px] font-medium">
                    API key
                  </TableCell>
                  <TableCell className="h-auto py-2">
                    <Badge
                      variant="secondary"
                      className="pointer-events-none px-2 py-0.5 font-mono text-xs"
                    >
                      ••••••••••••••••
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="border-t hover:bg-transparent">
                  <TableCell className="text-muted-foreground w-1/4 py-4 pl-6 text-[13px] font-medium">
                    Base URL
                  </TableCell>
                  <TableCell className="py-4 font-mono text-[13px]">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <span>
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3000"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-primary -ml-1 transition-colors"
                        onClick={copyBaseUrl}
                        title="Copy Base URL"
                      >
                        {copiedBaseUrl ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="border-t hover:bg-transparent">
                  <TableCell className="text-muted-foreground py-4 pl-6 text-[13px] font-medium">
                    Created
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4 text-[13px]">
                    {new Date(apiKey.createdAt).toLocaleDateString()} at{" "}
                    {new Date(apiKey.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/20 border-t hover:bg-transparent">
                  <TableCell className="text-muted-foreground py-4 pl-6 text-[13px] font-medium">
                    Risk Actions
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 -ml-3 h-8 gap-2 px-3"
                      onClick={() => setDeleteTarget({ id: apiKey.id, name: apiKey.name })}
                    >
                      <Trash2 className="size-3.5" />
                      Revoke this key
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* SDK usage */}
      <Card className="bg-muted/10 mt-8 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SDK Integration</CardTitle>
          <CardDescription className="text-xs">
            Install the SDK and use your API key to evaluate flags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Install
                </div>
                <div className="bg-muted/50 flex items-center gap-1 rounded-lg p-0.5">
                  {(Object.keys(INSTALL_COMMANDS) as PkgManager[]).map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                        selectedPkg === pkg
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-card ring-foreground/5 flex w-full items-center justify-between gap-5 rounded-lg border pl-4 pr-1 ring-1">
                <pre className="overflow-x-auto py-3 font-mono text-xs">
                  {INSTALL_COMMANDS[selectedPkg]}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyCommand}
                  className="h-8 w-8 shrink-0"
                >
                  {copiedCommand ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <div className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                Usage
              </div>
              <pre className="bg-card ring-foreground/5 overflow-x-auto rounded-lg border p-3 font-mono text-xs ring-1">
                {`import { createClient } from "@gatekeeper/sdk"

const client = createClient({
  apiKey: "ffh_your_api_key",
  baseUrl: "${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}"
})

const enabled = await client.isEnabled(
  "your_flag_name",
  { userId: "user_123" }
)

if (enabled) {
  // Show new feature
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
