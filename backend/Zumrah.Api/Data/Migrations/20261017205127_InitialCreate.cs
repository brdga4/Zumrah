using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Zumrah.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "admin",
                columns: table => new
                {
                    admin_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    username = table.Column<string>(type: "varchar(100)", nullable: false),
                    email = table.Column<string>(type: "varchar(255)", nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin", x => x.admin_id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "college",
                columns: table => new
                {
                    college_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    college_name = table.Column<string>(type: "varchar(200)", nullable: false),
                    created_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    updated_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_college", x => x.college_id);
                    table.ForeignKey(
                        name: "FK_college_admin_created_by_admin_id",
                        column: x => x.created_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_college_admin_updated_by_admin_id",
                        column: x => x.updated_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "course",
                columns: table => new
                {
                    course_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    course_code = table.Column<string>(type: "varchar(30)", nullable: false),
                    course_name = table.Column<string>(type: "varchar(200)", nullable: false),
                    created_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    updated_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course", x => x.course_id);
                    table.ForeignKey(
                        name: "FK_course_admin_created_by_admin_id",
                        column: x => x.created_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_course_admin_updated_by_admin_id",
                        column: x => x.updated_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "major",
                columns: table => new
                {
                    major_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    college_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    major_name = table.Column<string>(type: "varchar(200)", nullable: false),
                    created_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    updated_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_major", x => x.major_id);
                    table.ForeignKey(
                        name: "FK_major_admin_created_by_admin_id",
                        column: x => x.created_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_major_admin_updated_by_admin_id",
                        column: x => x.updated_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_major_college_college_id",
                        column: x => x.college_id,
                        principalTable: "college",
                        principalColumn: "college_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "chat_room",
                columns: table => new
                {
                    chat_room_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    room_type = table.Column<string>(type: "varchar(10)", nullable: false),
                    course_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    major_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_room", x => x.chat_room_id);
                    table.CheckConstraint("chk_chat_room_owner", "(\n                    (room_type = 'COURSE'\n                        AND course_id IS NOT NULL\n                        AND major_id IS NULL)\n                    OR\n                    (room_type = 'MAJOR'\n                        AND major_id IS NOT NULL\n                        AND course_id IS NULL)\n                )");
                    table.ForeignKey(
                        name: "FK_chat_room_course_course_id",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id");
                    table.ForeignKey(
                        name: "FK_chat_room_major_major_id",
                        column: x => x.major_id,
                        principalTable: "major",
                        principalColumn: "major_id");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "major_course",
                columns: table => new
                {
                    major_course_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    major_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    course_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    added_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    added_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_major_course", x => x.major_course_id);
                    table.ForeignKey(
                        name: "FK_major_course_admin_added_by_admin_id",
                        column: x => x.added_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_major_course_course_course_id",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_major_course_major_major_id",
                        column: x => x.major_id,
                        principalTable: "major",
                        principalColumn: "major_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "student",
                columns: table => new
                {
                    student_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    microsoft_object_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    university_email = table.Column<string>(type: "varchar(255)", nullable: false),
                    name = table.Column<string>(type: "varchar(200)", nullable: false),
                    major_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_student", x => x.student_id);
                    table.ForeignKey(
                        name: "FK_student_major_major_id",
                        column: x => x.major_id,
                        principalTable: "major",
                        principalColumn: "major_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "course_file",
                columns: table => new
                {
                    file_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    course_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    uploaded_by_student_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    file_name = table.Column<string>(type: "varchar(255)", nullable: false),
                    blob_path = table.Column<string>(type: "varchar(500)", nullable: false),
                    status = table.Column<string>(type: "varchar(10)", nullable: false, defaultValue: "PENDING"),
                    uploaded_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    reviewed_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_file", x => x.file_id);
                    table.ForeignKey(
                        name: "FK_course_file_admin_reviewed_by_admin_id",
                        column: x => x.reviewed_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_course_file_course_course_id",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_course_file_student_uploaded_by_student_id",
                        column: x => x.uploaded_by_student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "enrollment",
                columns: table => new
                {
                    enrollment_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    student_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    course_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enrollment", x => x.enrollment_id);
                    table.ForeignKey(
                        name: "FK_enrollment_course_course_id",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_enrollment_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "message",
                columns: table => new
                {
                    message_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    chat_room_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    student_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    sent_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    is_deleted = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    deleted_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message", x => x.message_id);
                    table.ForeignKey(
                        name: "FK_message_admin_deleted_by_admin_id",
                        column: x => x.deleted_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_message_chat_room_chat_room_id",
                        column: x => x.chat_room_id,
                        principalTable: "chat_room",
                        principalColumn: "chat_room_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_message_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "report",
                columns: table => new
                {
                    report_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    message_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    student_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "varchar(20)", nullable: false, defaultValue: "PENDING"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false),
                    reviewed_by_admin_id = table.Column<Guid>(type: "char(36)", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_report", x => x.report_id);
                    table.ForeignKey(
                        name: "FK_report_admin_reviewed_by_admin_id",
                        column: x => x.reviewed_by_admin_id,
                        principalTable: "admin",
                        principalColumn: "admin_id");
                    table.ForeignKey(
                        name: "FK_report_message_message_id",
                        column: x => x.message_id,
                        principalTable: "message",
                        principalColumn: "message_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_report_student_student_id",
                        column: x => x.student_id,
                        principalTable: "student",
                        principalColumn: "student_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_admin_email",
                table: "admin",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_admin_username",
                table: "admin",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_chat_room_course_id",
                table: "chat_room",
                column: "course_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_chat_room_major_id",
                table: "chat_room",
                column: "major_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_college_college_name",
                table: "college",
                column: "college_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_college_created_by_admin_id",
                table: "college",
                column: "created_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_college_updated_by_admin_id",
                table: "college",
                column: "updated_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_course_course_code",
                table: "course",
                column: "course_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_course_created_by_admin_id",
                table: "course",
                column: "created_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_course_updated_by_admin_id",
                table: "course",
                column: "updated_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_course_file_blob_path",
                table: "course_file",
                column: "blob_path",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_course_file_course_id",
                table: "course_file",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_course_file_reviewed_by_admin_id",
                table: "course_file",
                column: "reviewed_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_course_file_uploaded_by_student_id",
                table: "course_file",
                column: "uploaded_by_student_id");

            migrationBuilder.CreateIndex(
                name: "IX_enrollment_course_id",
                table: "enrollment",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_enrollment_student_id_course_id",
                table: "enrollment",
                columns: new[] { "student_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_major_college_id_major_name",
                table: "major",
                columns: new[] { "college_id", "major_name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_major_created_by_admin_id",
                table: "major",
                column: "created_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_major_updated_by_admin_id",
                table: "major",
                column: "updated_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_major_course_added_by_admin_id",
                table: "major_course",
                column: "added_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_major_course_course_id",
                table: "major_course",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_major_course_major_id_course_id",
                table: "major_course",
                columns: new[] { "major_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_message_chat_room_id",
                table: "message",
                column: "chat_room_id");

            migrationBuilder.CreateIndex(
                name: "IX_message_deleted_by_admin_id",
                table: "message",
                column: "deleted_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_message_student_id",
                table: "message",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_report_message_id",
                table: "report",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "IX_report_reviewed_by_admin_id",
                table: "report",
                column: "reviewed_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_report_student_id_message_id",
                table: "report",
                columns: new[] { "student_id", "message_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_student_major_id",
                table: "student",
                column: "major_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_microsoft_object_id",
                table: "student",
                column: "microsoft_object_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_student_university_email",
                table: "student",
                column: "university_email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_file");

            migrationBuilder.DropTable(
                name: "enrollment");

            migrationBuilder.DropTable(
                name: "major_course");

            migrationBuilder.DropTable(
                name: "report");

            migrationBuilder.DropTable(
                name: "message");

            migrationBuilder.DropTable(
                name: "chat_room");

            migrationBuilder.DropTable(
                name: "student");

            migrationBuilder.DropTable(
                name: "course");

            migrationBuilder.DropTable(
                name: "major");

            migrationBuilder.DropTable(
                name: "college");

            migrationBuilder.DropTable(
                name: "admin");
        }
    }
}
