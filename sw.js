self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);
    if (url.pathname.indexOf('/_download') !== -1) {
        var targetUrl = url.searchParams.get('url');
        var fileName = url.searchParams.get('name') || 'dosya.pdf';
        event.respondWith(
            fetch(targetUrl).then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.blob();
            }).then(function(blob) {
                return new Response(blob, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': "attachment; filename=\"" + fileName + "\""
                    }
                });
            }).catch(function() {
                return new Response('Redirect...', {
                    status: 302,
                    headers: { 'Location': targetUrl }
                });
            })
        );
    }
});
