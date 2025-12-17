import { IndexDB } from '../database/index_db.js'
const TEST_DB_NAME = "testdb";
const TEST_USER = "test";
const database = new IndexDB(TEST_DB_NAME, TEST_USER);

// Get関数
// 引数：Key ("HP", "MP", "EN", "MY")
export async function getData(key) {
    let data;
    if (key){
        data = await database.getStatusOne(key);
    } else {
        data = await database.getStatusAll();
    }
    return data;
}

// Update関数
export async function setData(key, val) {
    const data = await database.getStatusOne("parameter");
    if (!data) {
        throw new Error("Parameter data not found");
    }
    data[key] = val;
    await database.updateStatusOne("parameter", data);
    return data;
}

// パラメータ取得
export async function getParameters() {
    return await database.getStatusOne("parameter") || null;
}

// パラメータ一括更新
export async function modifyData(newParameters) {
    await database.updateStatusOne("parameter", newParameters);
    return newParameters;
}