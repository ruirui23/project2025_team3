import Dexie from 'dexie';

class IndexDB {
    constructor(db_name, user_id) {
        /* 
        * IndexDBへの接続・初期化
        * 
        * 引数:
        * db_name データベース名
        * user_id ユーザー名
        * 
        * 返値:
        * IndexDB
        */
        this.db = new Dexie(db_name);
        this.db.version(1).stores({
            users: '++id, &user_id, user_name, user_pass',
            status: '++id, level, rank, parameter',
            diaries: '++id, &diary_id, entries'
        });

        this._init(user_id);
    }

    async _init(user_id){
        this.user = await this.db.users.get(user_id);
        if (!this.user) {
            await this.db.users.add({
                user_id,
                user_name: user_id
            });
            let level = JSON.stringify({ level: 0, exp: 0 });
            let rank = JSON.stringify({ rank: 0, rp: 0 });
            let parameter = JSON.stringify({});
            await this.db.status.add({
                level,rank,parameter
            })
            this.user = await this.db.users.get(user_id);
        }
    }

    async changeUser(user_id) {
        /* 
        * 変更：ユーザー
        *
        * 引数:
        * user_id ユーザーID
        * 
        * 返値:
        * True||False
        */
        this._init(user_id);
        this.statusCache = undefined;
        this.statusCache = undefined;
        return this.user == user_id
    }

    async updateStatusAll(level, rank, parameter) {
        /* 
        * 更新：ステータス
        *
        * 引数:
        * level     レベル
        * rank      ランク
        * parameter パラメーター
        */
        if (!this.user) return;
        
        await this.db.status.update(this.user.id, {
            'level': JSON.stringify(level),
            'rank': JSON.stringify(rank),
            'parameter': JSON.stringify(parameter),
        });
    }
    async updateStatusOne(key, data) {
        /* 
        * 更新：１つのステータス
        *
        * 引数:
        * key   ステータス
        * data  データ
        */
        if (!this.user) return;

        await this.db.status.update(this.user.id, {
            [key]: JSON.stringify(data),
        });
    }

    async updateDiariy(key, entries) {
        /* 
        * 更新：１つのステータス
        *
        * 引数:
        * key   年月NUM
        * entries  日ごとデータ
        */
        if (!this.user) return;

        diariy_id = this.user.user_id + key;
        diariy = this.db.diaries.get(diariy_id);
        if (!diariy) {
            await this.db.diaries.add({
                diariy_id,
                'entries':JSON.stringify(entries)
            });
        } else {
            await this.db.diaries.update(diariy_id, {
                'entries': JSON.stringify(data),
            });
        }
    }

    async updateUserName(newName) {
        /* 
        * 更新：ユーザー名
        *
        * 引数:
        * newName   新しい名前
        */
        if (!this.user) return;

        await this.db.users.update(this.user.id, { user_name: newName });
        this.user.user_name = newName;
    }
    async updateUserId(newId) {
        if (!this.user) return;

        await this.db.users.update(this.user.id, { user_id: newId });
        this.user.user_id = newId;
    }

    getStatusAll(){
        /* 
        * 取得：ステータス
        *
        * 引数:
        * なし
        * 
        * 返値:
        * { "level": {...}, "rank": {...}, "parameter": {...} }
        */
        if (!this.user) return null;

        this.statusCache = this.db.status.get(this.user.id);
        return {
            level: JSON.parse(this.statusCache.level),
            rank: JSON.parse(this.statusCache.rank),
            parameter: JSON.parse(this.statusCache.parameter)
        };
    }
    getStatusOne(key){
        /* 
        * 取得：１つのステータス
        *
        * 引数:
        * key   ステータス
        * 
        * 返値:
        * { ... }
        */
        if (!this.user) return null;

        if (!['level', 'rank', 'parameter'].includes(key)) {
            return null;
        }
        
        return JSON.parse(
            this.db.status.get(this.user.id)[key]
        );
    }

    getDiariy(key) {
        /* 
        * 更新：１つのステータス
        *
        * 引数:
        * key   年月NUM
        * 
        * 返値:
        * { ... }
        */
        if (!this.user) return;

        diariy_id = this.user.user_id + key;
        
        return this.db.diaries.get(diariy_id);
    }

    getUserName(){
        /* 
        * 取得：ユーザー名
        *
        * 引数:
        * なし
        * 
        * 返値:
        * ユーザー名
        */
        if (!this.user) return null;
        return this.user['user_name'];
    }
    getUserId(){
        /* 
        * 取得：ユーザーID
        *
        * 引数:
        * なし
        * 
        * 返値:
        * ユーザーID
        */
        if (!this.user) return null;
        return this.user['user_id'];
    }
}