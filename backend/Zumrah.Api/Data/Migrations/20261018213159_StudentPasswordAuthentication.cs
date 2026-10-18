using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zumrah.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class StudentPasswordAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_student_microsoft_object_id",
                table: "student");

            migrationBuilder.DropColumn(
                name: "microsoft_object_id",
                table: "student");

            migrationBuilder.AddColumn<string>(
                name: "password_hash",
                table: "student",
                type: "varchar(255)",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "password_hash",
                table: "student");

            migrationBuilder.AddColumn<Guid>(
                name: "microsoft_object_id",
                table: "student",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_student_microsoft_object_id",
                table: "student",
                column: "microsoft_object_id",
                unique: true);
        }
    }
}
