import { RoomGateway } from "../../gateways/room_gateway";
import { SendChatMessageUseCase } from "../../../domain/use_cases/send_chat_message_use_case";

const gateway = new RoomGateway();
const sendChatMessageUseCase = new SendChatMessageUseCase(gateway);

export const useSendChatMessage = () => {
    const sendChatMessage = (text: string) => {
        sendChatMessageUseCase.execute(text);
    };

    return { sendChatMessage };
};