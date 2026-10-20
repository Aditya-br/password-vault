"use client"
import React, { useEffect, useState } from 'react'
import { decryptText } from '../utilities/decoder'
import { usePassword } from '../Context/passwordContext'
import { getApiUrl } from '../utilities/apiUrl'
import { Icon, ICONS, ErrorNotice, btnPrimary } from './vaultui'

const hostOf = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

const websiteUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
            ? parsedUrl
            : null;
    } catch {
        return null;
    }
};

const SecretLogo = ({ label, url }) => {
    const [hasLogo, setHasLogo] = useState(Boolean(url));
    const [useSiteFavicon, setUseSiteFavicon] = useState(false);
    const parsedUrl = websiteUrl(url);
    const logoUrl = parsedUrl
        ? useSiteFavicon
            ? `${parsedUrl.origin}/favicon.ico`
            : `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(parsedUrl.origin)}&sz=128`
        : null;

    useEffect(() => {
        setHasLogo(Boolean(parsedUrl));
        setUseSiteFavicon(false);
    }, [url]);

    return (
        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0E1726] font-[family-name:var(--font-display)] text-lg font-semibold text-[#D4A24C]">
            {hasLogo && logoUrl && (
                <img
                    src={logoUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full bg-white object-contain p-1"
                    onError={() => {
                        if (!useSiteFavicon) setUseSiteFavicon(true);
                        else setHasLogo(false);
                    }}
                />
            )}
            {(label || '?').charAt(0).toUpperCase()}
        </span>
    );
};

const ShowSecret = ({ refreshKey = 0, onAdd }) => {
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedLabel, setCopiedLabel] = useState(null);
    const [confirmLabel, setConfirmLabel] = useState(null);
    const [notice, setNotice] = useState("");
    const { encryptionKey, sessionToken } = usePassword();

    useEffect(() => {
        fetchSecrets();
    }, [refreshKey]);

    // Errors fade out on their own.
    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(""), 4000);
        return () => clearTimeout(t);
    }, [notice]);

    const fetchSecrets = async () => {
        try {
            const response = await fetch(`${getApiUrl()}showsecret`, {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify({})
            });
            if (response.status === 200) {
                const data = await response.json();
                // Backend returns { secrets: [...] }
                const secretsArray = data.secrets || [];
                // Map database field names (capitalized) to lowercase for frontend
                const normalizedSecrets = secretsArray.map(secret => ({
                    id: secret._id,
                    label: secret.Label,
                    username: secret.Username,
                    url: secret.URL,
                    note: secret.Note,
                    encodedPassword: secret.encodedPassword
                }));
                setSecrets(normalizedSecrets);
            } else {
                console.error('Error fetching secrets:', response.statusText);
                setSecrets([]);
            }
        } catch (error) {
            console.error('Error fetching secrets:', error);
            setSecrets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (label) => {
        try {
            const response = await fetch(`${getApiUrl()}getsecret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify({ label: label })
            });
            if (response.status === 200) {
                const data = await response.json();
                const pass = await decryptText(data.encodedPassword, encryptionKey);
                await navigator.clipboard.writeText(pass);
                setCopiedLabel(label);
                setTimeout(() => setCopiedLabel(null), 2000);
            } else {
                console.error('Error copying secret:', response.statusText);
                setNotice('Couldn’t copy that password. Try again.');
            }
        } catch (error) {
            console.error('Error copying secret:', error);
            setNotice('Couldn’t copy that password. Try again.');
        }
    };

    const handleDelete = async (label) => {
        try {
            const response = await fetch(`${getApiUrl()}removesecret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify({ label: label })
            });
            if (response.status === 200) {
                // Refresh the secrets list after deletion
                setSecrets(secrets.filter(secret => secret.label !== label));
            } else {
                console.error('Error deleting secret:', response.statusText);
                setNotice('Couldn’t delete that password. Try again.');
            }
        } catch (error) {
            console.error('Error deleting secret:', error);
            setNotice('Couldn’t delete that password. Try again.');
        } finally {
            setConfirmLabel(null);
        }
    };

    const filteredSecrets = Array.isArray(secrets)
        ? secrets.filter(secret =>
            secret.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            secret.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    if (loading) {
        return (
            <div aria-busy="true" aria-label="Loading your vault">
                <div className="mb-3 h-8 w-48 animate-pulse rounded-lg bg-[#0E1726]/10 motion-reduce:animate-none" />
                <div className="mb-8 h-4 w-24 animate-pulse rounded bg-[#0E1726]/10 motion-reduce:animate-none" />
                <div className="mb-6 h-12 animate-pulse rounded-xl bg-[#0E1726]/10 motion-reduce:animate-none" />
                <div className="divide-y divide-[#0E1726]/10 overflow-hidden rounded-2xl bg-white ring-1 ring-[#0E1726]/10">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                            <div className="h-11 w-11 animate-pulse rounded-xl bg-[#0E1726]/10 motion-reduce:animate-none" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 animate-pulse rounded bg-[#0E1726]/10 motion-reduce:animate-none" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-[#0E1726]/10 motion-reduce:animate-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Heading + count */}
            <div className="mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em]">
                    Your passwords
                </h2>
                <p className="mt-1 text-sm text-[#5B6577]" aria-live="polite">
                    {filteredSecrets.length} {filteredSecrets.length === 1 ? 'password' : 'passwords'}
                    {searchQuery && ` found for “${searchQuery}”`}
                </p>
            </div>

            <ErrorNotice message={notice} className="mb-4" />

            {/* Search Bar */}
            <div className="relative mb-6">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid w-12 place-items-center text-[#5B6577]">
                    <Icon d={ICONS.search} className="h-5 w-5" />
                </span>
                <input
                    type="search"
                    aria-label="Search passwords"
                    placeholder="Search by site or username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#0E1726]/15 bg-white py-3 pl-12 pr-4 text-[#0E1726] outline-none placeholder:text-[#8A93A3] transition focus:border-[#0E1726] focus:ring-4 focus:ring-[#0E1726]/10"
                />
            </div>

            {/* Empty State */}
            {filteredSecrets.length === 0 && !searchQuery && (
                <div className="rounded-2xl border border-dashed border-[#0E1726]/20 px-6 py-16 text-center">
                    <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#0E1726] text-[#D4A24C]">
                        <Icon d={ICONS.lock} className="h-7 w-7" />
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">No passwords yet</h3>
                    <p className="mx-auto mb-6 mt-2 max-w-xs text-[#5B6577]">
                        Save your first login and it will show up here.
                    </p>
                    {onAdd && (
                        <button onClick={onAdd} className={btnPrimary}>
                            <Icon d={ICONS.plus} className="h-4 w-4" />
                            Add password
                        </button>
                    )}
                </div>
            )}

            {/* No Search Results */}
            {filteredSecrets.length === 0 && searchQuery && (
                <div className="px-6 py-16 text-center">
                    <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#0E1726]/10 text-[#0E1726]">
                        <Icon d={ICONS.search} className="h-7 w-7" />
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">No results</h3>
                    <p className="mt-2 text-[#5B6577]">Check the spelling or try a different word.</p>
                </div>
            )}

            {/* Password list */}
            {filteredSecrets.length > 0 && (
                <ul className="divide-y divide-[#0E1726]/10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#0E1726]/10">
                    {filteredSecrets.map((secret) => {
                        const confirming = confirmLabel === secret.label;
                        const copied = copiedLabel === secret.label;
                        return (
                            <li key={secret.id} className="px-5 py-4">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <SecretLogo label={secret.label} url={secret.url} />

                                    {/* Details */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-medium">{secret.label}</h3>
                                        {secret.username && (
                                            <p className="truncate text-sm text-[#5B6577]">{secret.username}</p>
                                        )}
                                        {websiteUrl(secret.url) && (
                                            <a
                                                href={websiteUrl(secret.url).href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-0.5 inline-flex max-w-full items-center gap-1 text-sm text-[#0E1726] underline decoration-[#0E1726]/30 underline-offset-4 hover:decoration-[#0E1726] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726]"
                                            >
                                                <span className="truncate">{hostOf(secret.url)}</span>
                                                <Icon d={ICONS.external} className="h-3.5 w-3.5 shrink-0" />
                                            </a>
                                        )}
                                        {secret.note && (
                                            <p className="mt-1.5 line-clamp-2 text-sm text-[#5B6577]">{secret.note}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => handleCopy(secret.label)}
                                            aria-label={`Copy ${secret.label} password`}
                                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E1726] ${
                                                copied
                                                    ? 'bg-[#0E1726] text-white'
                                                    : 'bg-[#0E1726]/5 text-[#0E1726] hover:bg-[#0E1726]/10'
                                            }`}
                                        >
                                            <Icon d={copied ? ICONS.check : ICONS.copy} className="h-4 w-4" />
                                            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                        <button
                                            onClick={() => setConfirmLabel(secret.label)}
                                            aria-label={`Delete ${secret.label}`}
                                            className="rounded-lg p-2 text-[#5B6577] transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
                                        >
                                            <Icon d={ICONS.trash} className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Inline delete confirmation */}
                                {confirming && (
                                    <div role="alertdialog" aria-label={`Delete ${secret.label}?`} className="mt-4 flex flex-col gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
                                        <span>Delete “{secret.label}”? This can’t be undone.</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmLabel(null)}
                                                className="rounded-lg px-3 py-1.5 font-medium hover:bg-red-100 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleDelete(secret.label)}
                                                className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ShowSecret;