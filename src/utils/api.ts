export async function authFetch(url: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    } as any;

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Access Token이 만료된 경우 (401 또는 403)
    if ((response.status === 401 || response.status === 403) && refreshToken) {
        try {
            const refreshRes = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAccessToken = refreshData.accessToken;

                // 새 토큰 저장
                localStorage.setItem('accessToken', newAccessToken);

                // 원래 요청 재시도
                headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(url, { ...options, headers });
            } else {
                // 리프레시 토큰도 만료된 경우 로그아웃 처리
                handleAuthError();
            }
        } catch (err) {
            handleAuthError();
        }
    }

    return response;
}

function handleAuthError() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
}
