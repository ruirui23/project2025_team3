import Dexie from 'dexie';

const DB_NAME = 'testdatabase'

class DB {
    constructor(user_id) {
        // IndexDBへの接続・初期化
        this.db = new Dexie(DB_NAME);
        this.db.version(1).stores({
            users: '++id, &user_id, user_name, user_pass',
            status: '++id, level, rank, parameter',
            diaries: '++id, &diary_id, entries'
        });

        this._init(user_id);
    }

    async _init(user_id){
        // ユーザーの情報を取得、なければ新規作成
        this.user = await this.db.users.get(user_id);
        if (!this.user) {
            await this.db.users.add({
                user_id,
                user_name: user_id
            });
            let level = { level: 0, exp: 0 };
            let rank = { rank: 0, rp: 0 };
            let parameter = {};
            await this.db.status.add({
                level: JSON.stringify(level),
                rank: JSON.stringify(rank),
                parameter: JSON.stringify(parameter),
            })
            this.user = await this.db.users.get(user_id);
        }
    }

    async changeUser(user_id) {
        this._init(user_id);
        this.statusCache = undefined;
        this.statusCache = undefined;
    }

    async updateStatusAll(level, rank, parameter) {
        if (!this.user) return;
        
        await this.db.status.update(this.user.id, {
            level: JSON.stringify(level),
            rank: JSON.stringify(rank),
            parameter: JSON.stringify(parameter),
        });

        if (this.statusCache) {
            this.statusCache[key] = JSON.stringify(data);
        } else {
            this.statusCache = await this.db.status.get(this.user.id);
        }
    }
    async updateStatusOne(key, data) {
        if (!this.user) return;

        await this.db.status.update(this.user.id, {
            [key]: JSON.stringify(data),
        });

        if (this.statusCache) {
            this.statusCache[key] = JSON.stringify(data);
        } else {
            this.statusCache = await this.db.status.get(this.user.id);
        }
    }

    async updateUserName(newName) {
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
        if (!this.user) return null;

        if (!this.statusCache) {
            this.statusCache = this.db.status.get(this.user.id);
        }
        return {
            level: JSON.parse(this.statusCache.level),
            rank: JSON.parse(this.statusCache.rank),
            parameter: JSON.parse(this.statusCache.parameter)
        };
    }
    getStatusOne(key){
        if (!this.user) return null;

        if (!['level', 'rank', 'parameter'].includes(key)) {
            return null;
        }

        if (!this.statusCache) {
            this.statusCache = this.db.status.get(this.user.id);
        }
        return JSON.parse(this.statusCache[key]);
    }

    getUser(){
        if (!this.user) return null;
        return this.user;
    }
    getUserName(){
        if (!this.user) return null;
        return this.user['user_name'];
    }
    getUserId(){
        if (!this.user) return null;
        return this.user['user_id'];
    }
}