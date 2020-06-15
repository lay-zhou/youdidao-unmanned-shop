export const Query = {
    // 查找绑定的账户
    async account(_root, _params, ctx) {
        const { User, Account } = ctx.model;
        const user = await User.findByPk(ctx.state.user.sub);
        const result = await Account.findOne({
            where: {
                userId: user.id,
            },
            raw: true,
        });
        return result;
    }
};
export const Mutation = {
    async addAccount(_root, { input }, ctx) {
        const { User, Account } = ctx.model;
        const user = await User.findByPk(ctx.state.user.sub);
        const account = await Account.findOne({
            where: {
                userId: user.id,
            },
        });
        if (account) {
            return await account.update(input);
        } else {
            input.userId = user.id;
            return await Account.create(input);
        }
    },
    async updateAccount(_root, { input }, ctx) {
        const { User, Account } = ctx.model;
        const { name, card, phone, account, openId } = input;
        const data: any = {};
        if (name) data.name = name;
        if (card) data.card = card;
        if (phone) data.phone = phone;
        if (account) data.account = account;
        if (openId) data.openId = openId;
        const user = await User.findByPk(ctx.state.user.sub);
        const userAccount = await Account.findOne({ where: { userId: user.id } });
        return await userAccount.update(data);
    },
};