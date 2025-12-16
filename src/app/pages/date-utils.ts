export function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: first, endDate: last };
}

export function getCurrentYearRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    const last = new Date(now.getFullYear(), 11, 31);
    return { startDate: first, endDate: last };
}

export function formatDate(d: Date | string | null): string | null {
    if (!d) return null;

    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}
