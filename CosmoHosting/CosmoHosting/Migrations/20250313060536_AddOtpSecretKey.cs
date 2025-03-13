using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosmoHosting.Migrations
{
    /// <inheritdoc />
    public partial class AddOtpSecretKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OtpSecretKey",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OtpSecretKey",
                table: "Users");
        }
    }
}
