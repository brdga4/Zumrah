using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zumrah.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPendingRegistrationAndRestrictDeletes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_course_file_course_course_id",
                table: "course_file");

            migrationBuilder.DropForeignKey(
                name: "FK_course_file_student_uploaded_by_student_id",
                table: "course_file");

            migrationBuilder.DropForeignKey(
                name: "FK_enrollment_course_course_id",
                table: "enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_enrollment_student_student_id",
                table: "enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_major_college_college_id",
                table: "major");

            migrationBuilder.DropForeignKey(
                name: "FK_major_course_course_course_id",
                table: "major_course");

            migrationBuilder.DropForeignKey(
                name: "FK_major_course_major_major_id",
                table: "major_course");

            migrationBuilder.DropForeignKey(
                name: "FK_message_chat_room_chat_room_id",
                table: "message");

            migrationBuilder.DropForeignKey(
                name: "FK_message_student_student_id",
                table: "message");

            migrationBuilder.DropForeignKey(
                name: "FK_report_message_message_id",
                table: "report");

            migrationBuilder.DropForeignKey(
                name: "FK_report_student_student_id",
                table: "report");

            migrationBuilder.DropForeignKey(
                name: "FK_student_major_major_id",
                table: "student");

            migrationBuilder.CreateTable(
                name: "pending_registration",
                columns: table => new
                {
                    pending_registration_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    university_email = table.Column<string>(type: "varchar(255)", nullable: false),
                    name = table.Column<string>(type: "varchar(200)", nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", nullable: false),
                    major_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    otp_hash = table.Column<string>(type: "char(64)", nullable: false),
                    otp_expires_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    failed_attempts = table.Column<int>(type: "int", nullable: false),
                    last_otp_sent_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pending_registration", x => x.pending_registration_id);
                    table.ForeignKey(
                        name: "FK_pending_registration_major_major_id",
                        column: x => x.major_id,
                        principalTable: "major",
                        principalColumn: "major_id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_pending_registration_major_id",
                table: "pending_registration",
                column: "major_id");

            migrationBuilder.CreateIndex(
                name: "IX_pending_registration_university_email",
                table: "pending_registration",
                column: "university_email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_course_file_course_course_id",
                table: "course_file",
                column: "course_id",
                principalTable: "course",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_course_file_student_uploaded_by_student_id",
                table: "course_file",
                column: "uploaded_by_student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_enrollment_course_course_id",
                table: "enrollment",
                column: "course_id",
                principalTable: "course",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_enrollment_student_student_id",
                table: "enrollment",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_major_college_college_id",
                table: "major",
                column: "college_id",
                principalTable: "college",
                principalColumn: "college_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_major_course_course_course_id",
                table: "major_course",
                column: "course_id",
                principalTable: "course",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_major_course_major_major_id",
                table: "major_course",
                column: "major_id",
                principalTable: "major",
                principalColumn: "major_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_message_chat_room_chat_room_id",
                table: "message",
                column: "chat_room_id",
                principalTable: "chat_room",
                principalColumn: "chat_room_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_message_student_student_id",
                table: "message",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_report_message_message_id",
                table: "report",
                column: "message_id",
                principalTable: "message",
                principalColumn: "message_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_report_student_student_id",
                table: "report",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_student_major_major_id",
                table: "student",
                column: "major_id",
                principalTable: "major",
                principalColumn: "major_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_course_file_course_course_id",
                table: "course_file");

            migrationBuilder.DropForeignKey(
                name: "FK_course_file_student_uploaded_by_student_id",
                table: "course_file");

            migrationBuilder.DropForeignKey(
                name: "FK_enrollment_course_course_id",
                table: "enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_enrollment_student_student_id",
                table: "enrollment");

            migrationBuilder.DropForeignKey(
                name: "FK_major_college_college_id",
                table: "major");

            migrationBuilder.DropForeignKey(
                name: "FK_major_course_course_course_id",
                table: "major_course");

            migrationBuilder.DropForeignKey(
                name: "FK_major_course_major_major_id",
                table: "major_course");

            migrationBuilder.DropForeignKey(
                name: "FK_message_chat_room_chat_room_id",
                table: "message");

            migrationBuilder.DropForeignKey(
                name: "FK_message_student_student_id",
                table: "message");

            migrationBuilder.DropForeignKey(
                name: "FK_report_message_message_id",
                table: "report");

            migrationBuilder.DropForeignKey(
                name: "FK_report_student_student_id",
                table: "report");

            migrationBuilder.DropForeignKey(
                name: "FK_student_major_major_id",
                table: "student");

            migrationBuilder.DropTable(
                name: "pending_registration");

            migrationBuilder.AddForeignKey(
                name: "FK_course_file_course_course_id",
                table: "course_file",
                column: "course_id",
                principalTable: "course",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_course_file_student_uploaded_by_student_id",
                table: "course_file",
                column: "uploaded_by_student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_enrollment_course_course_id",
                table: "enrollment",
                column: "course_id",
                principalTable: "course",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_enrollment_student_student_id",
                table: "enrollment",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_major_college_college_id",
                table: "major",
                column: "college_id",
                principalTable: "college",
                principalColumn: "college_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_major_course_course_course_id",
                table: "major_course",
                column: "course_id",
                principalTable: "course",
                principalColumn: "course_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_major_course_major_major_id",
                table: "major_course",
                column: "major_id",
                principalTable: "major",
                principalColumn: "major_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_message_chat_room_chat_room_id",
                table: "message",
                column: "chat_room_id",
                principalTable: "chat_room",
                principalColumn: "chat_room_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_message_student_student_id",
                table: "message",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_report_message_message_id",
                table: "report",
                column: "message_id",
                principalTable: "message",
                principalColumn: "message_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_report_student_student_id",
                table: "report",
                column: "student_id",
                principalTable: "student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_student_major_major_id",
                table: "student",
                column: "major_id",
                principalTable: "major",
                principalColumn: "major_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
