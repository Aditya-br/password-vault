"use client"
import React, { useState } from 'react'
import { usePassword } from '../Context/passwordContext'
import { encryptText } from '../utilities/encoder'
import { getApiUrl } from '../utilities/apiUrl'
import { getSiteNameFromUrl } from '../utilities/siteName'
import {
    Icon,
    ICONS,
    Spinner,
    Field,
    PasswordField,
    ErrorNotice,
    ModalHeader,
    btnPrimary,
    btnSecondary,
} from './vaultui'

const CreateSecret = ({ onClose, onSaved }) => {
    const { encryptionKey, sessionToken } = usePassword();
    const [label, setLabel] = useState("");
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [note, setNote] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateSecret = async (label, password) => {
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
            const encodedPassword = await encryptText(password, encryptionKey);
            const response = await fetch(`${getApiUrl()}createsecret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify({
                    label: siteName,
                    encodedPassword,
                    note: note,
                    username: username,
                    url: url
                })
            });
            if (response.status === 201) {
                const data = await response.json();
                setLabel("");
                setPassword("");
                setUsername("");
                setUrl("");
                setNote("");
                // The dashboard shows a "Password saved" toast instead of a browser alert.
                if (onSaved) onSaved("Password saved");
                else if (onClose) onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create password');
            }
        } catch (error) {
            console.error('Error creating secret:', error);
            setError(error instanceof Error ? error.message : 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <ModalHeader
                title="Save a password"
                subtitle="Enter the login details you want to keep."
                onClose={onClose}
            />

            <ErrorNotice message={error} />

            <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSecret(label, password);
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

                <PasswordField
                    id="password"
                    label="Password"
                    placeholder="Enter the password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={`${btnSecondary} flex-1`}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className={`${btnPrimary} flex-1`}>
                        {loading ? (
                            <>
                                <Spinner />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Icon d={ICONS.check} className="h-5 w-5" />
                                Save password
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateSecret