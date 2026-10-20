"use client"
import React, { useState } from 'react'
import { usePassword } from '../Context/passwordContext';
import { encryptText } from '../utilities/encoder'
import { generatePassword } from '../utilities/passwordgenerator'
import { getApiUrl } from '../utilities/apiUrl'
import { getSiteNameFromUrl } from '../utilities/siteName'
import {
    Icon,
    ICONS,
    Spinner,
    Field,
    ErrorNotice,
    ModalHeader,
    btnPrimary,
    btnSecondary,
} from './vaultui'

const OptionRow = ({ checked, onChange, title, sample }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#0E1726]/10 bg-[#F6F8FA] px-4 py-3 transition-colors hover:bg-[#EEF1F4] focus-within:ring-2 focus-within:ring-[#0E1726]/30">
        <div className="flex items-center gap-3">
            <span className={`grid h-5 w-5 place-items-center rounded-md border transition-colors ${checked ? 'border-[#0E1726] bg-[#0E1726] text-white' : 'border-[#0E1726]/30 bg-white'}`}>
                {checked && <Icon d={ICONS.check} className="h-3 w-3" />}
            </span>
            <span className="font-medium">{title}</span>
        </div>
        <span className="font-[family-name:var(--font-mono)] text-sm text-[#5B6577]">{sample}</span>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
        />
    </label>
)

const PasswordGenerate = ({ onClose, onSaved }) => {
    const { encryptionKey, sessionToken } = usePassword();
    const [label, setLabel] = useState("");
    const [length, setLength] = useState(16);
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [note, setNote] = useState("");
    const [useUppercase, setUseUppercase] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSpecialCharacters, setUseSpecialCharacters] = useState(true);
    const [useLookAlikes, setUseLookAlikes] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateSecret = async () => {
        const siteName = label.trim() || getSiteNameFromUrl(url);
        if (!siteName) {
            setError("Enter a valid website URL to detect its site name");
            return;
        }

        setLoading(true);
        setError("");
        try {
            if (!encryptionKey || !sessionToken) {
                throw new Error('Please sign in again to unlock the vault');
            }
            const password = generatePassword(parseInt(length, 10), {
                useUppercase,
                useLowercase,
                useNumbers,
                useSpecial: useSpecialCharacters,
                useLookAlikes
            });
            const encodedPassword = await encryptText(password, encryptionKey);
            const response = await fetch(`${getApiUrl()}generatepassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify({
                    label: siteName,
                    username: username,
                    url: url,
                    note: note,
                    encodedPassword,
                })
            });
            if (response.status === 201) {
                const data = await response.json();
                setLabel("");
                // The dashboard shows a toast instead of a browser alert.
                if (onSaved) onSaved("Password generated and saved");
                else if (onClose) onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to generate password');
            }
        } catch (error) {
            console.error('Error creating secret:', error);
            setError(error instanceof Error ? error.message : 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <ModalHeader
                title="Generate a password"
                subtitle="Create a strong random password and save it."
                onClose={onClose}
            />

            <ErrorNotice message={error} />

            <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSecret();
            }} className="space-y-5">

                <Field
                    id="label"
                    label="Site name"
                    type="text"
                    placeholder="Automatically detected from website URL"
                    value={label}
                    onChange={(e) => setLabel(e.target.value || getSiteNameFromUrl(url))}
                />

                <Field
                    id="username"
                    label="Username or email"
                    type="text"
                    placeholder="Your username or email"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <Field
                    id="url"
                    label="Website URL"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => {
                        const nextUrl = e.target.value;
                        setUrl(nextUrl);
                        setLabel(getSiteNameFromUrl(nextUrl));
                    }}
                    required
                />

                <Field
                    id="note"
                    label="Notes"
                    optional
                    multiline
                    placeholder="Anything you want to remember about this login"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                {/* Password length */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <label htmlFor="length" className="text-sm font-medium">
                            Length
                        </label>
                        <span className="font-[family-name:var(--font-mono)] text-lg font-semibold">{length}</span>
                    </div>
                    <input
                        id="length"
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#0E1726]/10 accent-[#0E1726]"
                    />
                    <div className="mt-1 flex justify-between text-xs text-[#5B6577]">
                        <span>8</span>
                        <span>64</span>
                    </div>
                </div>

                {/* Character types */}
                <fieldset className="space-y-2">
                    <legend className="mb-3 text-sm font-medium">Characters to include</legend>
                    <OptionRow checked={useUppercase} onChange={setUseUppercase} title="Uppercase letters" sample="A-Z" />
                    <OptionRow checked={useLowercase} onChange={setUseLowercase} title="Lowercase letters" sample="a-z" />
                    <OptionRow checked={useNumbers} onChange={setUseNumbers} title="Numbers" sample="0-9" />
                    <OptionRow checked={useSpecialCharacters} onChange={setUseSpecialCharacters} title="Special characters" sample="!@#$%" />
                    <OptionRow checked={useLookAlikes} onChange={setUseLookAlikes} title="Look-alike characters" sample="0OIl" />
                </fieldset>

                {/* Tip */}
                <div className="flex items-start gap-3 rounded-xl bg-[#F6F8FA] p-4 text-sm text-[#5B6577]">
                    <Icon d={ICONS.info} className="mt-0.5 h-5 w-5 shrink-0 text-[#0E1726]" />
                    <p>
                        For the strongest result, use 16 or more characters with every type turned on.
                        Leave look-alikes off if you will ever type the password by hand.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={`${btnSecondary} flex-1`}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className={`${btnPrimary} flex-1`}>
                        {loading ? (
                            <>
                                <Spinner />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Icon d={ICONS.bolt} className="h-5 w-5" />
                                Generate and save
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PasswordGenerate