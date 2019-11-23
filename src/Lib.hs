module Lib where

    import Data.List (intersperse, transpose, replicate)
    import Data.List.Split (chunksOf)
    import Data.Maybe (fromMaybe)
    import Data.Text.Internal.Read (hexDigitToInt)
    import Numeric (showHex)
    
    data Cell =
      Unknown | Clear | Filled | SuggestClear | SuggestHintName HintName
      deriving (Eq)

    instance Show Cell where
      show Unknown = " "
      show Clear = "."
      show Filled = "*"
      show SuggestClear = "_"
      show (SuggestHintName (HintName a)) = show a
    
    lineToString :: Line -> String
    lineToString = concatMap show
    
    stringToLine :: String -> Line
    stringToLine = fmap charToCell
    
    charToCell :: Char -> Cell
    charToCell ' ' = Unknown
    charToCell '*' = Filled
    charToCell '.' = Clear
    charToCell '_' = SuggestClear
    charToCell c = SuggestHintName $ HintName $ hexDigitToInt c
    
    type Line = [Cell]
    type Hints = [Hint]
    type Lines = [Line]
    
    intsToHints :: [Int] -> Hints
    intsToHints [] = []
    intsToHints (n:ns) = (Hint (HintName (length ns)) n True:intsToHints ns)
    
    data Hint = Hint { name :: HintName
                     , value :: Int
                     , isFirstCell :: Bool
                     }
      deriving (Show, Eq)
    
    instance Ord Hint where
      compare h1 h2 = compare (name h1) (name h2)
    
    data HintName = HintName Int
      deriving (Eq, Ord)
    
    instance Show HintName where
      show (HintName a) = showHex a ""
    
    canClear :: Cell -> Bool
    canClear SuggestClear = True
    canClear Unknown = True
    canClear _ = False
    
    placeClear :: Line -> Maybe Line
    placeClear [] = Just []
    placeClear (Clear:line) = Just (Clear:line)
    placeClear (cell:line) =
      let
        canClearCell = canClear cell
        maybeClearedLine = placeClear line
      in
        if canClearCell then fmap (prefixWith SuggestClear) maybeClearedLine
        else Nothing
    
    prefixWith :: a -> [a] -> [a]
    prefixWith x xs = (x:xs)

    placeFromLeft :: Hints -> Line -> Maybe Line
    
    -- No hints in empty line
    placeFromLeft [] [] = Just []
    
    -- 0 size hint in empty line
    placeFromLeft [Hint _ 0 _] [] = Just []
    
    -- We have more hints to place, but have run out of space.
    placeFromLeft hints [] = Nothing
    
    -- We have just finished placing all hints, and there is some space left.
    -- Try to clear remaining space.
    placeFromLeft [] line = placeClear line
    
    -- We have just finished placing one hint, and its value is down to 0.
    -- There is room for a SuggestClear in the cell to the right, so we'll place it there as padding.
    placeFromLeft ((Hint hn 0 _):hints) (Unknown:line) =
      let
        maybePlaced = placeFromLeft hints line
      in
        case maybePlaced of
          Nothing -> Nothing
          Just placed -> Just (SuggestClear:placed)
    
    -- We have just finished placing one hint, and its value is down to 0.
    -- There is already a Clear in the cell to the right, so we'll keep that as padding.
    placeFromLeft (hint@(Hint _ 0 _):hints) (Clear:line) =
      let
        maybePlaced = placeFromLeft hints line
      in
        case maybePlaced of
          Nothing -> Nothing
          Just placed -> Just (Clear:placed)
    
    -- We have just finished placing one hint, and its value is down to 0.
    -- There is already a SuggestClear in the cell to the right, so we'll keep that as padding.
    placeFromLeft (hint@(Hint _ 0 _):hints) (SuggestClear:line) =
      let
        maybePlaced = placeFromLeft hints line
      in
        case maybePlaced of
          Nothing -> Nothing
          Just placed -> Just (SuggestClear:placed)
    
    
    -- We are placing a hint, and there is room.
    -- Continue recursing after shortening the hint and remaining line.
    placeFromLeft (hint@(Hint name value isFirstCell):hints) (Unknown:line) =
      let
        shortenedHint = Hint name (value - 1) False
        maybePlaced = placeFromLeft (shortenedHint:hints) line
      in
        case maybePlaced of
          Just placed -> Just ((SuggestHintName name):placed)
          Nothing -> case isFirstCell of
            False -> Nothing
            True ->
              let
                maybePlaced' = placeFromLeft (hint:hints) line
              in
                case maybePlaced' of
                  Nothing -> Nothing
                  Just placed' -> Just (SuggestClear:placed')
    
    
    -- We are placing a hint, and the cell is filled.
    -- Continue recursing after shortening the hint and remaining line.
    placeFromLeft (hint@(Hint name value isFirstCell):hints) (Filled:line) =
      let
        shortenedHint = Hint name (value - 1) False
        maybePlaced = placeFromLeft (shortenedHint:hints) line
      in
        case maybePlaced of
          Nothing -> Nothing
          Just placed -> Just (Filled:placed)
    
    -- We are placing a hint, but the cell is occupied
    placeFromLeft ((Hint name value _):hints) (_:line) = Nothing
    
    
    placeFromRight :: Hints -> Line -> Maybe Line
    placeFromRight hints line =
      let
        numberOfHints = length hints
        rHints = reverse hints
        rLine = reverse line
        maybePlacedLine = placeFromLeft rHints rLine
        maybeReversedLine = fmap reverse maybePlacedLine
      in
        maybeReversedLine
    
    maybeOverlaps :: Line -> Maybe Line -> Maybe Line -> Maybe Line
    maybeOverlaps line Nothing Nothing = Nothing
    maybeOverlaps line (Just a) Nothing = Nothing
    maybeOverlaps line Nothing (Just b) = Nothing
    maybeOverlaps line (Just a) (Just b) = Just (zipWith3 overlapFill line a b)
    
    overlapFill :: Cell -> Cell -> Cell -> Cell
    overlapFill _ Clear Clear = Clear
    overlapFill _ Filled Filled = Filled
    overlapFill c (SuggestHintName a) (SuggestHintName b) =
      if a == b then Filled
      else c
    overlapFill c _ _ = c
    
    markAround :: Line -> Line
    markAround [] = []
    markAround (SuggestClear:Filled:cells) = (SuggestClear:Filled:(markAround cells))
    markAround (SuggestClear:(SuggestHintName hn):cells) = (SuggestClear:(SuggestHintName hn):(markAround cells))
    markAround (Filled:SuggestClear:cells) = (Filled:SuggestClear:(markAround cells))
    markAround ((SuggestHintName hn):SuggestClear:cells) = ((SuggestHintName hn):SuggestClear:(markAround cells))
    markAround (cell:cells) = (cell:(markAround cells))
    
    solveLine :: Hints -> Line -> Maybe Line
    solveLine [] line = Just line
    solveLine hints [] = Just []
    solveLine hints line =
      let
        maybeFromLeft = fmap markAround $ placeFromLeft hints line
        maybeFromRight = fmap markAround $ placeFromRight hints line
      in
        maybeOverlaps line maybeFromLeft maybeFromRight
    
    
    dRowHintss = fmap intsToHints [ [4, 1]
                                  , [1 ,5]
                                  , [3,1,3]
                                  , [4,4,2]
                                  , [1,2,6]
                                  , [2,2,2]
                                  , [3,2]
                                  , [1,2,3]
                                  , [2,5]
                                  , [7,1]
                                  , [3,1,3]
                                  , [3,1,1,2,1,1]
                                  , [4,1,1,2]
                                  , [3,2,5]
                                  , [5,2]
                                  ]
    
    dColumnHintss = fmap intsToHints [  [3]
                                      , [3,4]
                                      , [1,4,4]
                                      , [1,1,2,1,1]
                                      , [6,1,1,1]
                                      , [3,2,1,2,2]
                                      , [1,2,5]
                                      , [1,1,2]
                                      , [2,2,2]
                                      , [4,5]
                                      , [2,1,2,3]
                                      , [1,5,1,1]
                                      , [2,3,4,2]
                                      , [3,1,3]
                                      , [2,3]
                                      ]
    
    mRowHintss = fmap intsToHints [ [2, 1]
                                  , [1,4]
                                  , [1,2,2]
                                  , [1,1,4]
                                  , [1,4,1]
                                  , [1,3,1]
                                  , [1,1,4]
                                  , [1,1,1]
                                  , [4]
                                  , [4]
                                  ]
    
    mColumnHintss = fmap intsToHints [  [2,2]
                                      , [1,4]
                                      , [2]
                                      , [4]
                                      , [2,3,2]
                                      , [1,4,2]
                                      , [1,2,1,2]
                                      , [3,1,2]
                                      , [4]
                                      , [1,1]
                                      ]
    
    dRows = replicate 15 $ replicate 15 Unknown
    mRows = replicate 10 $ replicate 10 Unknown
    
    solveGrid :: [Hints] -> [Hints] -> Lines -> Lines
    solveGrid rowHintss columnHintss rows =
      let
        solvedRows = solveLines rowHintss rows
        columns = transpose solvedRows
        solvedColumns = solveLines columnHintss columns
      in
        transpose solvedColumns  
    
    solveLines :: [Hints] -> Lines -> Lines
    solveLines hintss lines = zipWith fromMaybe lines (zipWith solveLine hintss lines)
    
    solveGridUntilStable :: [Hints] -> [Hints] -> Lines -> Lines
    solveGridUntilStable rowHintss columnHintss rows =
      let
        solveWithHintsUntilStable = untilStable $ solveGrid rowHintss columnHintss
      in
        solveWithHintsUntilStable rows
    
    untilStable :: (Eq a) => (a -> a) -> (a -> a)
    untilStable fn = until (\x -> fn x == x) fn
    
    printStrings :: [String] -> IO()
    printStrings ss = putStrLn $ unlines ss

    rowsToStrings :: [Line] -> [String]
    rowsToStrings rows = fmap lineToString rows

    printGrid :: Lines -> IO() 
    printGrid rows = printStrings $ rowsToRowStrings rows
    
    mullionString :: String -> String
    mullionString s = mullion 5 "|" s

    mullionStrings :: [String] -> [String]
    mullionStrings ss = 
      let
        l = maxLength ss
        bar = replicate l '-'
        verticallyMullionedStrings = mullion 5 [bar] ss
      in
        fmap mullionString verticallyMullionedStrings

    printGridMullioned :: Lines -> IO()
    printGridMullioned rows = 
      let
        rowStrings = rowsToRowStrings rows
        mullionedRows = mullionStrings rowStrings
        framed = frame mullionedRows
      in
        printStrings framed
    
    rowsToRowStrings :: [Line] -> [String]
    rowsToRowStrings rows = fmap lineToString rows

    printGridFramed :: Lines -> IO() 
    printGridFramed rows = 
      let
        rowStrings = rowsToRowStrings rows
        framedRowStrings = frame rowStrings
      in
        printStrings $ framedRowStrings
    
    maxLength :: (Foldable t) => [t a] -> Int
    maxLength xss = (foldr max) 0 $ fmap length xss

    frame :: [String] -> [String]
    frame rowStrings =
      let
        framedRows = fmap (surroundWith "‖") rowStrings
        framedRowLength = maxLength framedRows
        bar = [replicate framedRowLength '=']
        framedRowStrings = surroundWith bar framedRows
      in
        framedRowStrings

    surroundWith :: [a] -> [a] -> [a]
    surroundWith around middle = around ++ middle ++ around
    
    mullion :: Int -> [a] -> [a] -> [a]
    mullion paneSize m s =
      let
        chunks = (chunksOf paneSize s)
      in
        concat $ intersperse m chunks

-- At least this isn't wrong:
-- printGridMullioned $ solveGridUntilStable mRowHintss mColumnHintss mRows
-- 
-- We should however now continue with placing Clear in a separate run after placing Filled.
-- TODO: Do a specific run to set any Clear cells around where we have identified:
--         complete Hint
    
