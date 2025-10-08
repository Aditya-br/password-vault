"use client"
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { decryptText } from '../utilities/decoder'
import { usePassword } from '../Context/passwordContext'
import { generateKey } from '../utilities/generatekey'

const ShowSecret = () => {
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedLabel, setCopiedLabel] = useState(null);
    const { masterPassword } = usePassword();
    const email = useSelector((state) => state.session.email);

    useEffect(() => {
        fetchSecrets();
    }, []);

    const fetchSecrets = async () => {
        try {
            const response = await fetch('http://localhost:5000/showsecret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    emailid: email, 
                })
            });
            if (response.status===200) {
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
            const response = await fetch('http://localhost:5000/getsecret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${masterPassword}`
                },
                body: JSON.stringify({ emailid: email, label: label })
            });
            if (response.status === 200) {
                const data = await response.json();
                const key = await generateKey(masterPassword, new Uint8Array(data.salt));
                const pass = await decryptText(data.encodedPassword, key);
                await navigator.clipboard.writeText(pass);
                setCopiedLabel(label);
                setTimeout(() => setCopiedLabel(null), 2000);
            } else {
                console.error('Error copying secret:', response.statusText);
                alert('Failed to copy password');
            }
        } catch (error) {
            console.error('Error copying secret:', error);
            alert('Error copying password');
        }
    };

    const handleDelete = async (label) => {
        if (!confirm(`Are you sure you want to delete "${label}"?`)) return;

        try {
            const response = await fetch('http://localhost:5000/removesecret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailid: email, label: label })
            });
            if (response.status === 200) {
                // Refresh the secrets list after deletion
                setSecrets(secrets.filter(secret => secret.label !== label));
            } else {
                console.error('Error deleting secret:', response.statusText);
                alert('Failed to delete password');
            }
        } catch (error) {
            console.error('Error deleting secret:', error);
            alert('Error deleting password');
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
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-purple-300">Loading your vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search passwords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Password Count */}
            <div className="mb-4">
                <p className="text-purple-300 text-sm">
                    {filteredSecrets.length} {filteredSecrets.length === 1 ? 'password' : 'passwords'} 
                    {searchQuery && ` found for "${searchQuery}"`}
                </p>
            </div>

            {/* Empty State */}
            {filteredSecrets.length === 0 && !searchQuery && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No passwords yet</h3>
                    <p className="text-purple-300 mb-6">Start securing your passwords by creating your first entry</p>
                </div>
            )}

            {/* No Search Results */}
            {filteredSecrets.length === 0 && searchQuery && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                    <p className="text-purple-300">Try searching with different keywords</p>
                </div>
            )}

            {/* Password Cards */}
            <div className="grid gap-4">
                {filteredSecrets.map((secret) => (
                    <div 
                        key={secret.id}
                        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    
                                    {/* Label & Username */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold text-lg truncate">{secret.label}</h3>
                                        {secret.username && (
                                            <p className="text-purple-300 text-sm truncate">{secret.username}</p>
                                        )}
                                    </div>
                                </div>

                                {/* URL */}
                                {secret.url && (
                                    <a 
                                        href={secret.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mb-2 w-fit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Visit site
                                    </a>
                                )}

                                {/* Note */}
                                {secret.note && (
                                    <p className="text-purple-300 text-sm mt-2 line-clamp-2">{secret.note}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleCopy(secret.label)}
                                    className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 rounded-lg transition-all relative"
                                    title="Copy password"
                                >
                                    {copiedLabel === secret.label ? (
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(secret.label)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-all"
                                    title="Delete password"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShowSecret;