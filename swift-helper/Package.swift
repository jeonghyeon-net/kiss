// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "kawa-helper",
    platforms: [
        .macOS(.v10_15)
    ],
    targets: [
        .executableTarget(
            name: "kawa-helper",
            dependencies: [],
            linkerSettings: [
                .linkedFramework("Carbon")
            ]
        )
    ]
)
