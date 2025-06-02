module.exports = {
	apps: [
		{
			name: "ft_transcendence",
			script: "./src/index.ts",
			interpreter: "ts-node",
			interpreter_args: " --project tsconfig.json",
			watch: ["src", "prisma"],
			ignore_watch: ["node_modules"],
			watch_options: {
				usePolling: true,
			},
			autorestart: true,
			restart_delay: 300,
			log_file: "./logs/ft_transcendence.log",
			log_date_format: 'YYYY-MM-DD HH:mm:ss',
			error_file: '/dev/null',
			out_file: '/dev/null',
			merge_logs: true,
		},
	],
};
