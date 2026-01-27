import Carbon
import Foundation

struct InputSource: Codable {
    let id: String
    let name: String
    let localizedName: String
}

func getInputSources() -> [InputSource] {
    var sources: [InputSource] = []

    guard let sourceList = TISCreateInputSourceList(nil, false)?.takeRetainedValue() as? [TISInputSource] else {
        return sources
    }

    for source in sourceList {
        guard let categoryPtr = TISGetInputSourceProperty(source, kTISPropertyInputSourceCategory) else {
            continue
        }
        let category = Unmanaged<CFString>.fromOpaque(categoryPtr).takeUnretainedValue() as String

        guard category == kTISCategoryKeyboardInputSource as String else {
            continue
        }

        guard let selectablePtr = TISGetInputSourceProperty(source, kTISPropertyInputSourceIsSelectCapable) else {
            continue
        }
        let isSelectable = Unmanaged<CFBoolean>.fromOpaque(selectablePtr).takeUnretainedValue()

        guard CFBooleanGetValue(isSelectable) else {
            continue
        }

        guard let idPtr = TISGetInputSourceProperty(source, kTISPropertyInputSourceID) else {
            continue
        }
        let id = Unmanaged<CFString>.fromOpaque(idPtr).takeUnretainedValue() as String

        var name = id
        if let namePtr = TISGetInputSourceProperty(source, kTISPropertyLocalizedName) {
            name = Unmanaged<CFString>.fromOpaque(namePtr).takeUnretainedValue() as String
        }

        sources.append(InputSource(id: id, name: name, localizedName: name))
    }

    return sources
}

func getCurrentInputSourceId() -> String? {
    guard let source = TISCopyCurrentKeyboardInputSource()?.takeRetainedValue(),
          let idPtr = TISGetInputSourceProperty(source, kTISPropertyInputSourceID) else {
        return nil
    }
    return Unmanaged<CFString>.fromOpaque(idPtr).takeUnretainedValue() as String
}

func selectInputSource(id: String) -> Bool {
    // 이미 해당 입력 소스면 스킵
    if getCurrentInputSourceId() == id {
        return true
    }

    guard let sourceList = TISCreateInputSourceList(nil, false)?.takeRetainedValue() as? [TISInputSource] else {
        return false
    }

    for source in sourceList {
        guard let idPtr = TISGetInputSourceProperty(source, kTISPropertyInputSourceID) else {
            continue
        }
        let sourceId = Unmanaged<CFString>.fromOpaque(idPtr).takeUnretainedValue() as String

        if sourceId == id {
            // 최대 3번 재시도
            for _ in 0..<3 {
                let result = TISSelectInputSource(source)
                if result != noErr {
                    return false
                }

                // 전환 완료 대기 후 확인
                usleep(10000) // 10ms

                if getCurrentInputSourceId() == id {
                    return true
                }
            }
            return false
        }
    }

    return false
}

let args = CommandLine.arguments

if args.count < 2 {
    print("Usage: kawa-helper <command> [args]")
    print("Commands:")
    print("  list      - List all input sources as JSON")
    print("  current   - Get current input source ID")
    print("  select <id> - Select input source by ID")
    exit(1)
}

let command = args[1]

switch command {
case "list":
    let sources = getInputSources()
    let encoder = JSONEncoder()
    if let jsonData = try? encoder.encode(sources),
       let jsonString = String(data: jsonData, encoding: .utf8) {
        print(jsonString)
    }

case "current":
    if let currentId = getCurrentInputSourceId() {
        print(currentId)
    } else {
        print("Error: Could not get current input source")
        exit(1)
    }

case "select":
    if args.count < 3 {
        print("Error: Missing input source ID")
        exit(1)
    }
    let sourceId = args[2]
    let success = selectInputSource(id: sourceId)
    print(success ? "true" : "false")
    exit(success ? 0 : 1)

default:
    print("Unknown command: \(command)")
    exit(1)
}
