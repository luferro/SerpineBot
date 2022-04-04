<<<<<<< HEAD
export class InteractionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
=======
import { InteractionCategories } from '../types/categories';

export class InteractionError extends Error {
    public category: InteractionCategories;

    constructor(message: string, category: InteractionCategories = 'COMMAND_INTERACTION') {
        super(message);
        this.name = this.constructor.name;
        this.category = category;
>>>>>>> e30afaeaa8be549bbae9b62e32153ca2ade16709
        Error.captureStackTrace(this, this.constructor);
    }
}