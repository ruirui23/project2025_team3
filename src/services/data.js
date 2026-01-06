import { IndexDB } from '../database/index_db.js'

const TEST_DB_NAME = "testdb";
const TEST_USER = "test";

// 初期化完了を待つPromise
let databasePromise = null;

async function getDatabase() {
    if (!databasePromise) {
        const db = new IndexDB(TEST_DB_NAME, TEST_USER);
        // 初期化完了を待つ（少し待機）
        databasePromise = new Promise((resolve) => {
            setTimeout(() => resolve(db), 100);
        });
    }
    return databasePromise;
}

// パラメータ取得
export async function getParameters() {
    const database = await getDatabase();
    return await database.getStatusOne("parameter") || null;
}

// パラメータ一括更新
export async function modifyData(newParameters) {
    const database = await getDatabase();
    await database.updateStatusOne("parameter", newParameters);
    return newParameters;
}

// 以下の関数は使っていなければ削除可能
export async function getData(key) {
    const database = await getDatabase();
    let data;
    if (key) {
        data = await database.getStatusOne(key);
    } else {
        data = await database.getStatusAll();
    }
    return data;
}

export async function setData(key, val) {
    const database = await getDatabase();
    const data = await database.getStatusOne("parameter");
    if (!data) {
        throw new Error("Parameter data not found");
    }
    data[key] = val;
    await database.updateStatusOne("parameter", data);
    return data;
}