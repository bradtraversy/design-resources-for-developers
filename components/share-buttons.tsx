'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Mail, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  showTooltip?: boolean;
}

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (url: string, title: string, description?: string) => string;
}

const shareOptions: ShareOption[] = [
  {
    name: 'Twitter',
    icon: (
      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    ),
    color: 'hover:text-black dark:hover:text-white',
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
      </svg>
    ),
    color: 'hover:text-[#0077b5]',
    getUrl: url =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
  },
  {
    name: 'Facebook',
    icon: (
      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
    ),
    color: 'hover:text-[#1877f2]',
    getUrl: url =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'Reddit',
    icon: (
      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z' />
      </svg>
    ),
    color: 'hover:text-[#ff4500]',
    getUrl: (url, title) =>
      `https://reddit.com/submit?url=${encodeURIComponent(
        url,
      )}&title=${encodeURIComponent(title)}`,
  },
  {
    name: 'Email',
    icon: <Mail className='w-5 h-5' />,
    color: 'hover:text-slate-600 dark:hover:text-slate-400',
    getUrl: (url, title, description) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        description || '',
      )}%0A%0A${encodeURIComponent(url)}`,
  },
];

export function ShareButtons({
  url,
  title,
  description,
  className,
  variant = 'ghost',
  size = 'icon',
  showTooltip = true,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Try native share API first (works on mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or error - fall through to show menu
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
    // Calculate position and show share menu on desktop
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + 8, // mt-2 = 8px
        left: buttonRect.right - 180, // min-w-[180px], align right
      });
    }
    setShowShareMenu(!showShareMenu);
  };


  const handleCopyLink = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTo = (option: ShareOption, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = option.getUrl(url, title, description);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    setShowShareMenu(false);
  };

  const renderShareButton = () => (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn(
        'rounded-lg transition-colors',
        showShareMenu && 'bg-slate-100 dark:bg-slate-800',
      )}
      aria-label='Share'
      aria-expanded={showShareMenu}
      title='Share'
    >
      {copied ? (
        <Check className='w-4 h-4 text-green-500' />
      ) : (
        <Share2 className='w-4 h-4' />
      )}
    </Button>
  );

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {showTooltip ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{renderShareButton()}</TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Share'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        renderShareButton()
      )}

      {/* Share Options Dropdown */}
      {showShareMenu &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
            }}
            className={cn(
              'z-50',
              'bg-white dark:bg-slate-900',
              'rounded-lg shadow-lg border border-slate-200 dark:border-slate-700',
              'py-2 min-w-[180px]',
              'animate-in fade-in zoom-in-95 duration-200',
            )}
          >
            {/* Copy Link Option */}
            <button
              onClick={handleCopyLink}
              className={cn(
                'w-full px-4 py-2 text-left text-sm',
                'flex items-center gap-3',
                'text-slate-700 dark:text-slate-300',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                'transition-colors',
              )}
            >
              {copied ? (
                <>
                  <Check className='w-4 h-4 text-green-500' />
                  <span className='text-green-500'>Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className='w-4 h-4' />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <div className='h-px bg-slate-200 dark:bg-slate-700 my-1' />

            {/* Social Media Options */}
            {shareOptions.map(option => (
              <button
                key={option.name}
                onClick={e => handleShareTo(option, e)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm',
                  'flex items-center gap-3',
                  'text-slate-700 dark:text-slate-300',
                  option.color,
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-colors',
                )}
              >
                {option.icon}
                <span>Share on {option.name}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
