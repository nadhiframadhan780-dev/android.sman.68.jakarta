export default function middleware(request) {
    const url = new URL(request.url);
    const referer = request.headers.get('referer') || '';
    const host = request.headers.get('host') || '';
    
    // File yang dilindungi
    const protectedExtensions = ['.css', '.js'];
    const isProtectedFile = protectedExtensions.some(ext => url.pathname.endsWith(ext));
    
    if (isProtectedFile) {
        // Izinkan jika dipanggil dari website sendiri
        if (referer.includes(host) || referer.includes('localhost') || referer.includes('127.0.0.1') || referer.includes('smanegeri68jakarta.vercel.app')) {
            // Akses sah dari HTML sendiri
            return new Response(null, {
                headers: {
                    'x-middleware-next': '1'
                }
            });
        }
        
        // Jika akses langsung (tanpa referer atau dari luar)
        // Tampilkan halaman password
        if (!referer || referer === '') {
            return new Response(getPasswordPage(), {
                status: 401,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'WWW-Authenticate': 'Basic realm="Protected"'
                }
            });
        }
        
        // Blok akses dari website lain
        return new Response('Akses tidak diizinkan', { status: 403 });
    }
    
    return new Response(null, {
        headers: {
            'x-middleware-next': '1'
        }
    });
}

function getPasswordPage() {
    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akses Dibatasi - SMAN 68 Jakarta</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: linear-gradient(135deg, #006633, #0088cc);
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 24px;
            padding: 40px 35px;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 70px rgba(0,0,0,0.3);
        }
        .logo {
            width: 80px; height: 80px;
            border-radius: 50%; background: white; padding: 6px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        h1 { color: #1e293b; font-size: 1.5rem; margin-bottom: 10px; }
        p { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.6; }
        .input-group { margin-bottom: 15px; text-align: left; }
        .input-group label { display: block; font-weight: 600; margin-bottom: 5px; color: #1e293b; font-size: 0.9rem; }
        .input-group input {
            width: 100%; padding: 14px 18px;
            border: 2px solid #e2e8f0; border-radius: 12px;
            font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem;
            transition: all 0.3s;
        }
        .input-group input:focus { outline: none; border-color: #006633; }
        .btn {
            width: 100%; padding: 14px;
            background: linear-gradient(135deg, #006633, #0088cc);
            color: white; border: none; border-radius: 12px;
            font-weight: 700; font-size: 1rem; cursor: pointer;
            margin-top: 10px; transition: all 0.3s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,102,51,0.3); }
        .error { color: #ef4444; font-size: 0.85rem; margin-top: 10px; display: none; }
        .error.show { display: block; }
        .back-link { margin-top: 20px; }
        .back-link a { color: #0088cc; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="card">
        <img src="https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png" alt="SMAN 68" class="logo">
        <h1>Akses Dibatasi</h1>
        <p>File ini tidak dapat diakses secara langsung. Silakan akses melalui website resmi SMAN 68 Jakarta.</p>
        <div class="back-link">
            <a href="/sman68.html"><i class="fas fa-arrow-left"></i> Kembali ke Website</a>
        </div>
    </div>
</body>
</html>`;
}

export const config = {
    matcher: ['/((?!api|_next|favicon.ico).*)'],
};
