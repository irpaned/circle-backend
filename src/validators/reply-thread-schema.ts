// berfungsi untuk menentukan type data apa yang harus di isi

import joi from "joi";
import { ReplyThreadDTO } from "../dto/reply-thread";

export const replyThreadSchemaJoi = joi.object<ReplyThreadDTO>({
  content: joi.string().min(1).max(255).required(),
  image: joi.string().allow(null, ""),
});
