// BackupButtonAxios.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function BackupButtonAxios() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [msg, setMsg] = useState(null);

    const handleDownload = async () => {
        setLoading(true);
        setProgress(0);
        setMsg(null);

        try {
            const response = await axios({
                url: '/backup/download-db',
                method: 'POST',
                responseType: 'blob',
                timeout: 1000 * 60 * 10,
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.lengthComputable) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    } else {
                        // لو الخادم لا يرسل الطول الكلي، نقدر نعرض تقدم تقريبي
                        setProgress((p) => Math.min(99, p + 1));
                    }
                },
            });

            // الآن لدينا Blob في response.data لكن قد يكون Blob عبارة عن JSON (خطأ من السيرفر).
            const blob = response.data;
            if (!blob || !(blob instanceof Blob) || blob.size === 0) {
                throw new Error('Received invalid or empty file.');
            }

            // إذا كان الـ blob من نوع JSON/text، فقد يعني ده خطأ - نقرأ نصه ونحاول نحلّله
            const contentType = blob.type || '';
            if (contentType.includes('application/json') || contentType.includes('text/')) {
                // اقرأ نص وحاول parse json لعرض رسالة خطأ
                const text = await blob.text().catch(() => null);
                if (text) {
                    try {
                        const parsed = JSON.parse(text);
                        const serverMsg = parsed.message || parsed.error || JSON.stringify(parsed);
                        throw new Error('Server error: ' + serverMsg);
                    } catch (e) {
                        // مش JSON، لكن فيه نص (HTML أو نص خطأ)
                        throw new Error('Server returned unexpected text response: ' + (text.slice ? text.slice(0, 500) : text));
                    }
                } else {
                    throw new Error('Received empty response from server.');
                }
            }

            // استخراج اسم الملف من هيدر Content-Disposition
            let filename = 'db_backup.sql.gz';
            const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
            if (disposition) {
                // دعم صيغ متعددة: filename*=UTF-8''..., filename="..."
                const fileNameMatch = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition);
                if (fileNameMatch) {
                    filename = decodeURIComponent(fileNameMatch[1] || fileNameMatch[2] || fileNameMatch[3]);
                }
            }

            // تنزيل الملف
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setMsg('Backup downloaded: ' + filename);
        } catch (err) {
            console.error(err);
            // axios errors (network / timeout) قد يحتوي على response.data كـ Blob أو JSON
            let message = 'Backup failed: ' + (err.message || 'Unknown error');

            // لو الـ err.response موجود وحجمه Blob، حاول قراءته
            if (err.response && err.response.data && err.response.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    // حاول JSON
                    try {
                        const j = JSON.parse(text);
                        message = 'Backup failed: ' + (j.message || j.error || JSON.stringify(j));
                    } catch {
                        message = 'Backup failed: ' + (text.slice ? text.slice(0, 500) : text);
                    }
                } catch (readErr) {
                    // لا فائدة من قراءة البايناري
                }
            }

            setMsg(message);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div>
            <button onClick={handleDownload} disabled={loading}>
                {loading ? `Creating backup... ${progress ? progress + '%' : ''}` : 'Download DB Backup'}
            </button>

            {loading && <div style={{ marginTop: 8 }}>Progress: {progress}%</div>}
            {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </div>
    );
}
