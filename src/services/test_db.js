// In-memory calendar data for testing without IndexedDB.
export const CALENDER_DATA = {
    y2025m11: {
        d1: {
            diarys: [
                { title: "テスト日記１", text: "こんなことがあったよ", parameters: { hp: 10, mp: 20 } },
                { title: "テスト日記２", text: "こんなことがあったよ", parameters: { hp:-10, mp: 30 } },
                { title: "テスト日記３", text: "こんなことがあったよ", parameters: { hp:  0, mp:-10 } }
            ]
        },
        d2: {
            diarys: [
                { title: "テスト日記１", text: "こんなことがあったよ", parameters: { hp: 10, mp: 20 } },
                { title: "テスト日記２", text: "こんなことがあったよ", parameters: { hp:-10, mp: 30 } },
                { title: "テスト日記３", text: "こんなことがあったよ", parameters: { hp:  0, mp:-10 } }
            ]
        },
        d8: {
            diarys: [
                { title: "テスト日記１", text: "こんなことがあったよ", parameters: { hp: 10, mp: 20 } },
                { title: "テスト日記２", text: "こんなことがあったよ", parameters: { hp:-10, mp: 30 } },
                { title: "テスト日記３", text: "こんなことがあったよ", parameters: { hp:  0, mp:-10 } }
            ]
        }
    }
};

const buildKey = (year, month) => `y${year}m${month}`;

export async function calendar_get(year, month) {
    const key = buildKey(year, month);
    return CALENDER_DATA[key] ?? null;
}

export async function calendar_set(year, month, entries) {
    const key = buildKey(year, month);
    CALENDER_DATA[key] = entries;
    return CALENDER_DATA[key];
}
