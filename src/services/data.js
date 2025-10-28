import { DB } from '../database/db.js'

const TEST_USER = "test";
const database = new DB(TEST_USER);

// Get関数
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
    data[key] = val;
    await database.updateStatusOne("parameter", data);
    return data;
}

export async function modifyData(key, val) {
    const data = await database.getStatusOne("parameter") || {};
    data[key] = (data[key] || 0) + val;
    await database.updateStatusOne("parameter", data);
    return data;
}

// パラメータ取得
export async function getParameters() {
    return await database.getStatusOne("parameter") || null;
}
