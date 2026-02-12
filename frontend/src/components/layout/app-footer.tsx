'use client';

import { appConfig } from '@/lib/app.config';
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function AppFooter() {
  const year = new Date().getFullYear();
  const { social, legal } = appConfig;

  const hasSocial = social.github || social.twitter || social.linkedin || social.discord;

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>{year} {appConfig.name}</span>
            {legal.privacyUrl && (
              <Link href={legal.privacyUrl} className="hover:text-foreground">
                Privacy
              </Link>
            )}
            {legal.termsUrl && (
              <Link href={legal.termsUrl} className="hover:text-foreground">
                Terms
              </Link>
            )}
          </div>

          {hasSocial && (
            <div className="flex items-center gap-3">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
