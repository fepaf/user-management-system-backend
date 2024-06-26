import { BaseQueryParametersDto } from "src/shared/dto/base-query-parameters.dto";

export class FindUsersQueryDto extends BaseQueryParametersDto {
    name: string;
    lastName: string;
    email: string;
    status: boolean;
    role: string;
}