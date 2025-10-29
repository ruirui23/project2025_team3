import { DB } from '../database/db.js'

TEST_USER = "test";

database = DB(TEST_USER);

// Getdate関数

//引数：Key ("HP", "MP", EN, MY)
function getData(key) {
    if (key){
        data = database.getStatusOne(key);
    } else {
        data = database.getStatusAll();
    }
    return data;
}

// Update関数

function setData(key, val) {
    data = database.getStatusOne("parameter");

    data[key] = val;

    database.updateStatusOne("parameter", data);

    return data;
}

function modifyData(key, val) {
    data = database.getStatusOne("parameter");
// 
    data[key] += val;

    database.updateStatusOne("parameter", data);

    return data;
}
