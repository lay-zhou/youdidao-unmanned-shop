import { Service } from 'egg';

export default class ItemClassifyService extends Service {
    // 获取列表
    async fetch() {
        const { model, service } = this.ctx;
        const { ItemClassify } = model;
        const result = await ItemClassify.findAll({ raw: true });
        const newList: any = [];
        const resultList = result;
        for (const iterator of resultList) {
            if (iterator.imageKey) {
                iterator.imageUrl = await service.file.generatePrivateDownloadUrl(iterator.imageKey);
                await newList.push(iterator);
            } else {
                iterator.imageUrl = null;
                await newList.push(iterator);
            }
        };
        return newList;
    };

    // 添加
    async add(input) {
        const { model } = this.ctx;
        const { ItemClassify } = model;
        const result = await ItemClassify.create(input);
        return result;
    };

    // 更新
    async update(input) {
        const { model } = this.ctx;
        const { ItemClassify } = model;
        const item = await ItemClassify.findByPk(input.id);
        const data: any = {};
        if (input.title) data.title = input.title;
        if (input.imageKey) data.imageKey = input.imageKey;
        await item.update(data);
        return item;
    };

    // 删除
    async remove(id) {
        const { model } = this.ctx;
        const { ItemClassify } = model;
        const item = await ItemClassify.findByPk(id);
        await item.destroy();
        return true;
    }
}
