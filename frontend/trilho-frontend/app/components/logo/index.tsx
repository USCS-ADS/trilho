interface LogoProps {
    size?: number;
}

export function Logo({ size = 48 }: LogoProps) {
    return (
        <div
            className="flex items-center justify-center rounded-xl bg-gradient-trilho font-bold text-white"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            T
        </div>
    );
}
