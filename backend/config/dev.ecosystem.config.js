module.exports = {
	apps: [
		{
			name: "ft_transcendence",
			script: "./src/server.ts",
			interpreter: "ts-node",
			interpreter_args: " --project tsconfig.json",
			watch: ["src", "prisma"],
			ignore_watch: ["node_modules"],
			watch_options: {
				usePolling: true,
			},
			autorestart: true,
			restart_delay: 100,
			log_file: "./logs/ft_transcendence.log",
			out_file: "./logs/ft_transcendence_out.log",
			error_file: "./logs/ft_transcendence_error.log",
			merge_logs: true,
		},
	],
};