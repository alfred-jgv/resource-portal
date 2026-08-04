import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';

@Injectable()
export class ClubsService {
    constructor(private prisma: PrismaService) { }

    /** 
     * DOCU: Creates a new club record in the registry.
     * @param {CreateClubDto} dto - Validated club data
     * @returns {Promise<Club>} - The newly created club
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    create(dto: CreateClubDto) {
        return this.prisma.club.create({ data: dto });
    }

    /** 
     * DOCU: Returns every club in the registry.
     * @returns {Promise<Club[]>} - All clubs, most recently created first
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    findAll() {
        return this.prisma.club.findMany({ orderBy: { createdAt: 'desc' } });
    }

    /** 
     * DOCU: Finds a single club by id.
     * @param {string} id - Club id
     * @returns {Promise<Club>} - The matching club
     * @throws {NotFoundException} - If no club exists with that id
     *
     * Last Updated: 2026-08-05
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async findOne(id: string) {
        const club = await this.prisma.club.findUnique({ where: { id } });
        if (!club) throw new NotFoundException('Club not found');
        return club;
    }

    /*
     * DOCU: Deletes a club by id.
     * @param {string} id - Club id
     * @returns {Promise<Club>} - The deleted club
     * @throws {NotFoundException} - If no club exists with that id
     *
     * Last Updated: 2026-08-04
     * Author: Alfred
     * Last Updated By: Alfred
     */
    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.club.delete({ where: { id } });
    }
}