"use client";

import { useState } from "react";
import { useToken } from "@/lib/token-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Check, Copy } from "lucide-react";

export function TokenInput() {
  const { token, setToken } = useToken();
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setToken(inputValue.trim());
      setInputValue("");
      setIsExpanded(false);
    }
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateToken = (t: string) => {
    if (t.length <= 40) return t;
    return `${t.slice(0, 20)}...${t.slice(-15)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Key className="h-4 w-4" />
          JWT Token
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
              {truncateToken(token)}
            </code>
            <Button variant="ghost" size="icon" onClick={copyToken}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isExpanded ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Paste new JWT token..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 font-mono text-xs"
              />
              <Button type="submit" size="sm">
                Apply
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full"
            >
              Change Token
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground">
            You can also pass the token via URL: <code>?token=YOUR_JWT_TOKEN</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
