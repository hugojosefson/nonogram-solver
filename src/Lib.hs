module Lib where

    import Data.List (intersperse, transpose, replicate)
    import Data.List.Split (chunksOf)
    import Data.Maybe (catMaybes, fromMaybe)
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
    placeClear (cell:line)
      | canClearCell = fmap (prefixWith SuggestClear) maybeClearedLine
      | otherwise = Nothing
      where
        canClearCell = canClear cell
        maybeClearedLine = placeClear line
    
    prefixWith :: a -> [a] -> [a]
    prefixWith x xs = (x:xs)

    if' :: Bool -> Maybe a -> Maybe a
    if' True x = x
    if' False _ = Nothing

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
      fmap (prefixWith SuggestClear) $ placeFromLeft hints line
    
    -- We have just finished placing one hint, and its value is down to 0.
    -- There is already a Clear in the cell to the right, so we'll keep that as padding.
    placeFromLeft ((Hint _ 0 _):hints) (Clear:line) =
      fmap (prefixWith Clear) $ placeFromLeft hints line

    -- We are placing a hint, and there is room.
    -- Continue recursing after shortening the hint and remaining line.
    placeFromLeft (hint@(Hint name value isFirstCell):hints) (Unknown:line) =
      let
        restHint = Hint name (value - 1) False
        maybePlaced = placeFromLeft (restHint:hints) line
      in
        case maybePlaced of
          Just placed -> Just $ prefixWith (SuggestHintName name) placed
          Nothing -> if' isFirstCell $ fmap (prefixWith SuggestClear) $ placeFromLeft (hint:hints) line
    
    -- We are placing a hint, and the cell is filled.
    -- Continue recursing after shortening the hint and remaining line.
    placeFromLeft (hint@(Hint name value isFirstCell):hints) (Filled:line) =
      let
        restHint = Hint name (value - 1) False
        maybePlaced = placeFromLeft (restHint:hints) line
      in
        fmap (prefixWith Filled) maybePlaced
    
    -- We are placing a hint, but the cell is already marked Clear
    placeFromLeft ((Hint _ _ _):hints) (Clear:line) = Nothing
    
    
    placeFromRight :: Hints -> Line -> Maybe Line
    placeFromRight hints line =
      let
        numberOfHints = length hints
        rHints = reverse hints
        rLine = reverse line
        maybePlacedLine = placeFromLeft rHints rLine
      in
        fmap reverse maybePlacedLine
    
    maybeOverlaps :: Line -> Maybe Line -> Maybe Line -> Maybe Line
    maybeOverlaps line (Just a) (Just b) = Just (zipWith3 overlapFill line a b)
    maybeOverlaps line _ _ = Nothing
    
    overlapFill :: Cell -> Cell -> Cell -> Cell
    overlapFill _ Clear Clear = Clear
    overlapFill _ Filled Filled = Filled
    overlapFill c (SuggestHintName a) (SuggestHintName b)
      | a == b = Filled
      | otherwise = c
    overlapFill c _ _ = c
    
    solveLine :: Hints -> Line -> Maybe Line
    solveLine [] line = Just line
    solveLine hints [] = Just []
    solveLine hints line =
      let
        maybeFromLeft = placeFromLeft hints line
        maybeFromRight = placeFromRight hints line
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
    
    untilUnstable :: (Eq a) => (a -> a) -> (a -> a)
    untilUnstable fn = until (\x -> not (fn x == x)) fn
    
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
        chunks = chunksOf paneSize s
      in
        concat $ intersperse m chunks

-- At least this isn't wrong:
-- printGridMullioned $ solveGridUntilStable mRowHintss mColumnHintss mRows
-- 
-- We should however now continue with placing Clear in a separate run after placing Filled.
--
-- Find ways to short circuit in overlapPossibilities/findPossibilities, when we find an Unknown.
-- Alternate between solveGridUntilStable and overlapPossibilities/findPossibilities untilUnstable.

    reducePossibleCell :: Cell -> Cell -> Cell
    reducePossibleCell Clear Clear = Clear
    reducePossibleCell Filled Filled = Filled
    reducePossibleCell SuggestClear SuggestClear = Clear
    reducePossibleCell Clear SuggestClear = Clear
    reducePossibleCell SuggestClear Clear = Clear
    reducePossibleCell (SuggestHintName a) (SuggestHintName b) =
      if a == b then SuggestHintName a
      else Unknown
    reducePossibleCell _ _ = Unknown

    resolvePossibleCells :: [Cell] -> Cell
    resolvePossibleCells [] = Unknown
    resolvePossibleCells [c] = c
    resolvePossibleCells cells = foldr1 reducePossibleCell cells
      
    overlapPossibilities :: [Line] -> Line
    overlapPossibilities lines =
      let
        columns = transpose lines
        lineOfCertainties = fmap resolvePossibleCells columns
      in
        lineOfCertainties

    findPossibilities :: Hints -> Line -> [Line]
    findPossibilities hints line = catMaybes $ attemptPlace hints line

    attemptPlace :: Hints -> Line -> [Maybe Line]

    -- No hints in empty line
    attemptPlace [] [] = [Just []]
    
    -- 0 size hint in empty line
    attemptPlace [Hint _ 0 _] [] = [Just []]
    
    -- We have more hints to place, but have run out of space.
    attemptPlace hints [] = [Nothing]
    
    -- We have just finished placing all hints, and there is some space left.
    -- Try to clear remaining space.
    attemptPlace [] line = [placeClear line]
    
    -- We have just finished placing one hint, and its value is down to 0.
    -- There is room for a SuggestClear in the cell to the right, so we'll place it there as padding.
    attemptPlace ((Hint hn 0 _):hints) (Unknown:line) =
      let
        maybePlaceds = attemptPlace hints line
      in
        concatMap (\maybePlaced -> case maybePlaced of
          Nothing -> [Nothing]
          Just placed -> [Just (SuggestClear:placed)]
        ) maybePlaceds
    
    -- We have just finished placing one hint, and its value is down to 0.
    -- There is already a Clear in the cell to the right, so we'll keep that as padding.
    attemptPlace ((Hint _ 0 _):hints) (Clear:line) =
      let
        maybePlaceds = attemptPlace hints line
      in
        concatMap (\maybePlaced -> case maybePlaced of
          Nothing -> [Nothing]
          Just placed -> [Just (Clear:placed)]
        ) maybePlaceds
    
    -- We are placing a hint, and there is room.
    -- Continue recursing after shortening the hint and remaining line.
    attemptPlace (hint@(Hint name value isFirstCell):hints) (Unknown:line) =
      let
        restHint = Hint name (value - 1) False
        maybePlaceds = attemptPlace (restHint:hints) line
      in
        concatMap (\maybePlaced ->
        case maybePlaced of
          Just placed -> case isFirstCell of
            False -> [Just ((SuggestHintName name):placed)]
            True -> 
              let
                alternatives = fmap (fmap (\alt -> (SuggestClear:alt))) $ attemptPlace (hint:hints) line
              in
                (Just ((SuggestHintName name):placed):alternatives)
          Nothing -> case isFirstCell of
            False -> [Nothing]
            True ->
              let
                maybePlaceds' = attemptPlace (hint:hints) line
              in
                concatMap (\maybePlaced' ->
                case maybePlaced' of
                  Nothing -> [Nothing]
                  Just placed' -> [Just (SuggestClear:placed')]
                ) maybePlaceds'
        ) maybePlaceds
    
    -- We are placing a hint, and the cell is filled.
    -- Continue recursing after shortening the hint and remaining line.
    attemptPlace (hint@(Hint name value _):hints) (Filled:line) =
      let
        restHint = Hint name (value - 1) False
        maybePlaceds = attemptPlace (restHint:hints) line
      in
        concatMap (\maybePlaced ->
          case maybePlaced of
            Nothing -> [Nothing]
            Just placed -> [Just (Filled:placed)]
          ) maybePlaceds
    
    -- We are placing a hint, but the cell is already marked Clear
    attemptPlace ((Hint _ _ _):hints) (Clear:line) = [Nothing]
    
    attemptPlace hints line = errorWithoutStackTrace $ unlines $ ["<wat>"] ++ (fmap show hints) ++ ([lineToString line]) ++ ["<"]